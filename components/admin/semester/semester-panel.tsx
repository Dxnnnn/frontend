"use client";

import { useState } from "react";

import { SemesterCreateModal } from "@/components/admin/semester/semester-create-modal";
import { SemesterList } from "@/components/admin/semester/semester-list";

export function SemesterPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                School year & semester
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage semesters and the subjects graded in each term.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Add new semester
            </button>
          </div>

          <SemesterList refreshKey={refreshKey} />
        </section>
      </div>

      <SemesterCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}
