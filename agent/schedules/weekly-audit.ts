import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  // Monday at 06:00 UTC / 10:00 Asia-Tbilisi.
  cron: "0 6 * * 1",
  markdown: `Run the complete weekly Vivida audit now.

Compare the last 28 complete days with the preceding 28 days. Use all configured data sources and audit the most important public pages. Keep the final Georgian report under 7,000 characters, do not print it as a normal response, and finish only by calling publish_report exactly once. Do not make any website or repository changes.`,
});
