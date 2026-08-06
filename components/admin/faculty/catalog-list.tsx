"use client";

import { useState } from "react";

import {
  deleteDepartment,
  deleteSubject,
  formatCatalogDate,
  getDepartments,
  getSubjects,
} from "@/lib/catalog/storage";
import { useIsClient } from "@/lib/hooks/use-is-client";
import type { CatalogKind } from "@/lib/types/catalog";

interface CatalogListProps {
  kind: CatalogKind;
  refreshKey: number;
}

export function CatalogList({ kind, refreshKey }: CatalogListProps) {
  const isClient = useIsClient();
  const [, setRevision] = useState(0);

  void refreshKey;
  const items = !isClient
    ? []
    : kind === "departments"
      ? getDepartments()
      : getSubjects();

  const singular = kind === "departments" ? "department" : "subject";
  const listTitle =
    kind === "departments" ? "Department list" : "Subject list";

  function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Delete this ${singular}?\n\n${name}\n\nThis cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    if (kind === "departments") {
      deleteDepartment(id);
    } else {
      deleteSubject(id);
    }

    setRevision((current) => current + 1);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-600">
          No {singular}s yet
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Add a {singular} using the button above.
        </p>
      </div>
    );
  }

  return (
    <section className="flex max-h-96 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">{listTitle}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {items.length} {singular}
          {items.length === 1 ? "" : "s"} on record.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Added</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="text-slate-700">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {item.name}
                </td>
                <td className="px-6 py-4">
                  {formatCatalogDate(item.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
