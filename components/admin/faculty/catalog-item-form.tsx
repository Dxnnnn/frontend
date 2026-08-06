"use client";

import { useState, type FormEvent } from "react";

interface CatalogItemFormProps {
  label: string;
  placeholder: string;
  existsMessage: string;
  onSubmit: (name: string) => boolean;
  onCreated: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function CatalogItemForm({
  label,
  placeholder,
  existsMessage,
  onSubmit,
  onCreated,
}: CatalogItemFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(`${label} name is required.`);
      return;
    }

    const created = onSubmit(name);

    if (!created) {
      setError(existsMessage);
      return;
    }

    setName("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="catalog-item-name"
          className="block text-sm font-medium text-slate-700"
        >
          {label} name
        </label>
        <input
          id="catalog-item-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={placeholder}
          className={inputClassName}
          required
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="flex w-full shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
      >
        Save
      </button>
    </form>
  );
}
