/**
 * Retained as an inert compatibility export during deployment rollouts.
 * Chat now activates exclusively on /messages; the root layout does not mount
 * this component or issue a bootstrap request on every public page view.
 */
export function ChatShell() {
  return null;
}
