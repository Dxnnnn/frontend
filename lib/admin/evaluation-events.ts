export const EVAL_SUBMISSIONS_UPDATED_EVENT = "eval-submissions-updated";

export function notifyEvaluationsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(EVAL_SUBMISSIONS_UPDATED_EVENT));
}

export function onEvaluationsUpdated(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(EVAL_SUBMISSIONS_UPDATED_EVENT, handler);
  return () => window.removeEventListener(EVAL_SUBMISSIONS_UPDATED_EVENT, handler);
}
