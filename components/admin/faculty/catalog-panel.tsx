"use client";

import { useState } from "react";

import { CatalogCreateModal } from "@/components/admin/faculty/catalog-create-modal";
import { CatalogKindSwitch } from "@/components/admin/faculty/catalog-kind-switch";
import { CatalogList } from "@/components/admin/faculty/catalog-list";
import { addDepartment, addSubject } from "@/lib/catalog/storage";
import type { CatalogKind } from "@/lib/types/catalog";

const copy: Record<
  CatalogKind,
  {
    heading: string;
    description: string;
    addLabel: string;
    modalTitle: string;
    modalDescription: string;
    label: string;
    placeholder: string;
    existsMessage: string;
  }
> = {
  departments: {
    heading: "Departments",
    description: "View and manage departments used in the faculty form.",
    addLabel: "Add new department",
    modalTitle: "Add new department",
    modalDescription: "Fill in the department name below, then save the record.",
    label: "Department",
    placeholder: "e.g. Computer Science",
    existsMessage: "That department already exists.",
  },
  subjects: {
    heading: "Subjects",
    description: "View and manage subjects used when assigning faculty.",
    addLabel: "Add new subject",
    modalTitle: "Add new subject",
    modalDescription: "Fill in the subject name below, then save the record.",
    label: "Subject",
    placeholder: "e.g. Programming 1",
    existsMessage: "That subject already exists.",
  },
};

export function CatalogPanel() {
  const [kind, setKind] = useState<CatalogKind>("departments");
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const content = copy[kind];

  return (
    <>
      <div className="space-y-6">
        <CatalogKindSwitch
          kind={kind}
          onChange={(next) => {
            setKind(next);
            setCreateOpen(false);
          }}
        />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {content.heading}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{content.description}</p>
            </div>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              {content.addLabel}
            </button>
          </div>

          <CatalogList kind={kind} refreshKey={refreshKey} />
        </section>
      </div>

      <CatalogCreateModal
        open={createOpen}
        title={content.modalTitle}
        description={content.modalDescription}
        label={content.label}
        placeholder={content.placeholder}
        existsMessage={content.existsMessage}
        onSubmit={(name) =>
          kind === "departments"
            ? Boolean(addDepartment({ name }))
            : Boolean(addSubject({ name }))
        }
        onClose={() => setCreateOpen(false)}
        onCreated={() => setRefreshKey((current) => current + 1)}
      />
    </>
  );
}
