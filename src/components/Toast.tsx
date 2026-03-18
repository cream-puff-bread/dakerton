"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; message: string; type: ToastType; }

const Ctx = createContext<{ toast: (msg: string, type?: ToastType) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++_id;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);

  const colors: Record<ToastType, string> = {
    success: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900",
    error: "bg-red-500 text-white",
    info: "bg-[#5383EC] text-white",
  };

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`${colors[t.type]} px-5 py-3 rounded-2xl shadow-lg text-sm font-medium animate-slide-up`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
