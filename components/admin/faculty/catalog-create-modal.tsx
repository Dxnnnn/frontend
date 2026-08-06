"use client";

import { useEffect } from "react";

import { CatalogItemForm } from "@/components/admin/faculty/catalog-item-form";

interface CatalogCreateModalProps {
  open: boolean;
  title: string;
  description: string;
  label: string;
  placeholder: string;
  existsMessage: string;
  onSubmit: (name: string) => boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CatalogCreateModal({
  open,
  title,
  description,
  label,
  placeholder,
  existsMessage,
  onSubmit,
  onClose,
  onCreated,
}: CatalogCreateModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleCreated() {
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={`Close ${title.toLowerCase()} dialog`}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-create-dialog-title"
        className="portal-content-enter relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl"
      >
        <div className="shrink-0 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="catalog-create-dialog-title"
                className="text-xl font-semibold text-slate-900"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6l12 12M18 6L6 18"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          <CatalogItemForm
            label={label}
            placeholder={placeholder}
            existsMessage={existsMessage}
            onSubmit={onSubmit}
            onCreated={handleCreated}
          />
        </div>
      </div>
    </div>
  );
}
