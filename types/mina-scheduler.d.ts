declare module "mina-scheduler" {
  import type { ReactNode } from "react";

  export interface SchedulerProviderProps {
    children: ReactNode;
    initialState?: unknown[];
    weekStartsOn?: string;
  }

  export interface SchedularViewProps {
    views?: {
      views?: string[];
      mobileViews?: string[];
    };
    classNames?: Record<string, Record<string, string>>;
  }

  export function SchedulerProvider(props: SchedulerProviderProps): ReactNode;
  export function SchedularView(props: SchedularViewProps): ReactNode;
}
