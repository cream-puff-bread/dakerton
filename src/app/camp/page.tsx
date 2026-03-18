"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/components/Toast";
import { Team, Hackathon } from "@/lib/types";
import { Loading, Empty } from "@/components/UI";

const positions = ["Frontend", "Backend", "Designer", "ML Engineer", "PM", "DevOps"];

function CampContent() {
  const searchParams = useSearchParams();
  const hackathonFilter = searchParams.get("hackathon");
  const [teams, setTeams, loaded] = useLocalStorage<Team[]>("teams", []);
  const [hackathons] = useLocalStorage<Hackathon[]>("hackathons", []);
  const { toast } = useToast();
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [hackFilter, setHackFilter] = useState<string | null>(hackathonFilter);
  const [showForm, setShowForm] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIntro, setFormIntro] = useState("");
  const [formLooking, setFormLooking] = useState<string[]>([]);
  const [formContact, setFormContact] = useState("");
  const [formHackathon, setFormHackathon] = useState(hackathonFilter || "");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => teams.filter((t) => {
    if (hackFilter && t.hackathonSlug !== hackFilter) return false;
    if (posFilter && !t.lookingFor.includes(posFilter)) return false;
    return true;
  }), [teams, hackFilter, posFilter]);

  const resetForm = () => { setFormName(""); setFormIntro(""); setFormLooking([]); setFormContact(""); setFormHackathon(hackathonFilter || ""); setFormErrors({}); setEditCode(null); };

  const openEditForm = (team: Team) => {
    setEditCode(team.teamCode); setFormName(team.name); setFormIntro(team.intro);
    setFormLooking([...team.lookingFor]); setFormContact(team.contact.url); setFormHackathon(team.hackathonSlug); setShowForm(true);
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "필수 항목입니다";
    if (!formIntro.trim()) errors.intro = "필수 항목입니다";
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    if (editCode) {
      setTeams((prev) => prev.map((t) => t.teamCode === editCode ? { ...t, name: formName.trim(), intro: formIntro.trim(), lookingFor: formLooking, contact: { type: "link", url: formContact.trim() || "#" } } : t));
      toast("수정 완료");
    } else {
      setTeams((prev) => [{ teamCode: `T-${Date.now()}`, hackathonSlug: formHackathon || "general", name: formName.trim(), isOpen: true, memberCount: 1, lookingFor: formLooking, intro: formIntro.trim(), contact: { type: "link", url: formContact.trim() || "#" }, createdAt: new Date().toISOString() }, ...prev]);
      toast("등록 완료!");
    }
    resetForm(); setShowForm(false);
  };

  const toggleClose = (teamCode: string) => {
    setTeams((prev) => prev.map((t) => t.teamCode === teamCode ? { ...t, isOpen: !t.isOpen } : t));
    toast("모집 상태가 변경되었습니다.", "info");
  };

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#5383EC]/30 focus:border-[#5383EC] transition-all";
  const btnPrimary = "text-[13px] px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity";

  if (!loaded) return <Loading />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">팀 찾기</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={btnPrimary}>
          {showForm ? "닫기" : "모집글 작성"}
        </button>
      </div>
      {hackFilter && (
        <p className="text-sm text-zinc-400 mb-6">
          {hackathons.find((h) => h.slug === hackFilter)?.title}
          <button onClick={() => setHackFilter(null)} className="ml-2 text-[#5383EC] font-medium hover:underline">전체 보기</button>
        </p>
      )}
      {!hackFilter && <div className="mb-6"/>}

      {showForm && (
        <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 space-y-4 animate-slide-up">
          <h3 className="font-bold">{editCode ? "모집글 수정" : "새 모집글"}</h3>
          <div>
            <label className="text-sm font-medium mb-1.5 block">팀명 <span className="text-red-400">*</span></label>
            <input value={formName} onChange={(e) => { setFormName(e.target.value); setFormErrors((p) => ({ ...p, name: "" })); }} className={inputCls} placeholder="팀 이름" />
            {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">소개 <span className="text-red-400">*</span></label>
            <textarea value={formIntro} onChange={(e) => { setFormIntro(e.target.value); setFormErrors((p) => ({ ...p, intro: "" })); }} rows={3} className={inputCls + " resize-none"} placeholder="팀을 소개해주세요" />
            {formErrors.intro && <p className="text-xs text-red-400 mt-1">{formErrors.intro}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">모집 포지션</label>
            <div className="flex flex-wrap gap-2">
              {positions.map((p) => (
                <button key={p} onClick={() => setFormLooking((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
                  className={`text-xs px-3 py-2 rounded-xl font-semibold transition-colors ${formLooking.includes(p) ? "bg-[#5383EC] text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {!editCode && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">해커톤 연결</label>
              <select value={formHackathon} onChange={(e) => setFormHackathon(e.target.value)} className={inputCls}>
                <option value="">없음</option>
                {hackathons.map((h) => <option key={h.slug} value={h.slug}>{h.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1.5 block">연락 링크</label>
            <input value={formContact} onChange={(e) => setFormContact(e.target.value)} className={inputCls} placeholder="https://open.kakao.com/..." />
          </div>
          <button onClick={handleSubmit} className={btnPrimary + " w-full"}>{editCode ? "수정 완료" : "등록"}</button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button onClick={() => setPosFilter(null)}
          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${!posFilter ? "bg-[#EBF0FD] text-[#5383EC] dark:bg-[#5383EC]/15 dark:text-[#7BA0F0]" : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400"}`}>
          전체
        </button>
        {positions.map((p) => (
          <button key={p} onClick={() => setPosFilter(posFilter === p ? null : p)}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${posFilter === p ? "bg-[#EBF0FD] text-[#5383EC] dark:bg-[#5383EC]/15 dark:text-[#7BA0F0]" : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400"}`}>
            {p}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <Empty message="조건에 맞는 팀이 없습니다." /> : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.teamCode} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-[15px]">{t.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${t.isOpen ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"}`}>{t.isOpen ? "모집중" : "완료"}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2.5">{t.intro}</p>
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {t.lookingFor.map((lf) => <span key={lf} className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{lf}</span>)}
                  </div>
                  {t.hackathonSlug && t.hackathonSlug !== "general" && (
                    <Link href={`/hackathons/${t.hackathonSlug}`} className="text-xs text-[#5383EC] hover:underline">{hackathons.find((h) => h.slug === t.hackathonSlug)?.title || t.hackathonSlug}</Link>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">{t.memberCount}명</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a href={t.contact.url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-2 rounded-xl bg-[#5383EC] text-white font-semibold text-center">연락</a>
                  <button onClick={() => openEditForm(t)} className="text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">수정</button>
                  <button onClick={() => toggleClose(t.teamCode)} className={`text-xs px-3 py-2 rounded-xl font-semibold ${t.isOpen ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>{t.isOpen ? "마감" : "재개"}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CampPage() {
  return <Suspense fallback={<Loading />}><CampContent /></Suspense>;
}
