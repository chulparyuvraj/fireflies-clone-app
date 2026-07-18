"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<{ show: (message: string, kind?: ToastKind) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in min-w-[240px] max-w-sm rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur
              ${
                t.kind === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : t.kind === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-indigo-200 bg-indigo-50 text-indigo-800"
              }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
