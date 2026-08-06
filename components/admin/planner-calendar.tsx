"use client";

interface PlannerCalendarProps {
  compact?: boolean;
}

export function PlannerCalendar({ compact = false }: PlannerCalendarProps) {
  return (
    <div className={`flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400 ${compact ? "h-[520px]" : "h-64 w-full"}`}>
      Calendar coming soon
    </div>
  );
}
