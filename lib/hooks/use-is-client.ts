import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after client hydration — safe for localStorage reads. */
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
