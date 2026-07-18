"use client";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-[#17162b]">{title}</h3>
        <p className="mt-2 text-sm text-[#6b6483]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#e6e4f0] px-4 py-2 text-sm font-medium text-[#17162b] hover:bg-[#f6f6fb]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[#5b4fe9] hover:bg-[#4a3fd6]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
