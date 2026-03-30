"use client";
import { useState, useEffect, useCallback } from "react";
import {
  seedHackathons,
  seedHackathonDetails,
  seedTeams,
  seedLeaderboards,
  seedRankings,
  seedUsers,
} from "@/data/seed";

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function initSeedData() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("hackathons"))
    setStorage("hackathons", seedHackathons);
  if (!localStorage.getItem("hackathon_details"))
    setStorage("hackathon_details", seedHackathonDetails);
  if (!localStorage.getItem("teams")) setStorage("teams", seedTeams);
  if (!localStorage.getItem("leaderboards"))
    setStorage("leaderboards", seedLeaderboards);
  if (!localStorage.getItem("rankings")) setStorage("rankings", seedRankings);
  if (!localStorage.getItem("submissions")) setStorage("submissions", []);
  if (!localStorage.getItem("invitations")) setStorage("invitations", []);
  if (!localStorage.getItem("users")) setStorage("users", seedUsers);
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setValue(getStorage(key, fallback));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        setStorage(key, resolved);
        window.dispatchEvent(new CustomEvent("ls-update", { detail: key }));
        return resolved;
      });
    },
    [key]
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === key) {
        setValue(getStorage(key, fallback));
      }
    };
    window.addEventListener("ls-update", handler);
    return () => window.removeEventListener("ls-update", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, update, loaded] as const;
}
