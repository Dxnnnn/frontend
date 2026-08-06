"use client";

import { useEffect, useState } from "react";

import { getEvaluationSubmissionsAsync } from "@/lib/user/evaluation-submissions";
import { getSchoolHeadSubmissionsAsync } from "@/lib/faculty-portal/coordinator-submissions";

interface Stats {
  totalStudents: number;
  completedEvaluations: number;
  pendingEvaluations: number;
  totalFaculty: number;
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.replace("text-", "bg-").replace("-700", "-100").replace("-600", "-100")}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    completedEvaluations: 0,
    pendingEvaluations: 0,
    totalFaculty: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch total students + faculty from backend
        const [studentsRes, facultyRes] = await Promise.all([
          fetch("/api/dashboard-stats"),
          fetch("/api/faculty"),
        ]);

        const studentsData = await studentsRes.json() as { totalStudents?: number };
        const facultyData = await facultyRes.json() as { faculty?: unknown[] };

        const totalStudents = studentsData.totalStudents ?? 0;
        const totalFaculty = facultyData.faculty?.length ?? 0;

        // Completed evaluations from backend
        const [studentSubs, shSubs] = await Promise.all([
          getEvaluationSubmissionsAsync(),
          getSchoolHeadSubmissionsAsync(),
        ]);
        const completedEvaluations = studentSubs.length + shSubs.length;

        // Pending = students who haven't submitted yet (rough estimate)
        const pendingEvaluations = Math.max(0, totalStudents - completedEvaluations);

        setStats({ totalStudents, completedEvaluations, pendingEvaluations, totalFaculty });
      } catch {
        // silently fail, keep zeros
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      sub: "Registered in the system",
      color: "text-blue-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-blue-700" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1a4 4 0 014 0v2z" />
          <circle cx="9" cy="7" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 20v-2a4 4 0 00-3-3.87" />
        </svg>
      ),
    },
    {
      label: "Completed Evaluations",
      value: stats.completedEvaluations,
      sub: "Submitted by students & school heads",
      color: "text-emerald-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-emerald-700" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Pending Evaluations",
      value: stats.pendingEvaluations,
      sub: "Students yet to submit",
      color: "text-orange-600",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-orange-600" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      label: "Total Faculty",
      value: stats.totalFaculty,
      sub: "Instructors in the system",
      color: "text-violet-700",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-violet-700" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
