"use client";

import { useState } from "react";

import { FacultyCreateModal } from "@/components/admin/faculty/faculty-create-modal";
import { FacultyList } from "@/components/admin/faculty/faculty-list";

export function FacultyPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Faculty members
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage faculty records by department and subjects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Add new faculty
            </button>
          </div>

          <FacultyList refreshKey={refreshKey} />
        </section>
      </div>

      <FacultyCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}
