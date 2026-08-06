"use client";

import { NextUIProvider } from "@nextui-org/system";
import { SchedulerProvider, SchedularView } from "mina-scheduler";

import { initialPlannerEvents } from "@/lib/admin/planner-events";

interface PlannerCalendarProps {
  compact?: boolean;
}

export function PlannerCalendar({ compact = false }: PlannerCalendarProps) {
  return (
    <NextUIProvider>
      <SchedulerProvider initialState={initialPlannerEvents} weekStartsOn="monday">
        <div className={compact ? "max-h-[520px] overflow-auto" : "w-full"}>
          <SchedularView
            views={
              compact
                ? { views: ["month"], mobileViews: ["month"] }
                : { views: ["day", "week", "month"], mobileViews: ["day"] }
            }
            classNames={
              compact
                ? {
                    tabs: {
                      panel: "pt-2",
                    },
                  }
                : undefined
            }
          />
        </div>
      </SchedulerProvider>
    </NextUIProvider>
  );
}
