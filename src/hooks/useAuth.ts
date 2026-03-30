"use client";
import { useState, useEffect, useCallback } from "react";
import { User } from "@/lib/types";

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem("users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setUsers(users: User[]) {
  localStorage.setItem("users", JSON.stringify(users));
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  const login = useCallback((email: string, password: string): { ok: boolean; error?: string } => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
    localStorage.setItem("current_user", JSON.stringify(found));
    setUser(found);
    window.dispatchEvent(new CustomEvent("auth-change"));
    return { ok: true };
  }, []);

  const signup = useCallback((data: { email: string; password: string; nickname: string; preferredPositions: string[] }): { ok: boolean; error?: string } => {
    const users = getUsers();
    if (users.some((u) => u.email === data.email)) return { ok: false, error: "이미 사용 중인 이메일입니다." };
    if (users.some((u) => u.nickname === data.nickname)) return { ok: false, error: "이미 사용 중인 닉네임입니다." };
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      password: data.password,
      nickname: data.nickname,
      preferredPositions: data.preferredPositions,
      bio: "",
      createdAt: new Date().toISOString(),
    };
    setUsers([...users, newUser]);
    localStorage.setItem("current_user", JSON.stringify(newUser));
    setUser(newUser);
    window.dispatchEvent(new CustomEvent("auth-change"));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("current_user");
    setUser(null);
    window.dispatchEvent(new CustomEvent("auth-change"));
  }, []);

  const updateProfile = useCallback((updates: Partial<Pick<User, "nickname" | "bio" | "preferredPositions">>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const users = getUsers().map((u) => (u.id === user.id ? updated : u));
    setUsers(users);
    localStorage.setItem("current_user", JSON.stringify(updated));
    setUser(updated);
    window.dispatchEvent(new CustomEvent("auth-change"));
  }, [user]);

  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem("current_user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  return { user, loaded, login, signup, logout, updateProfile };
}
