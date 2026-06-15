import { runAutopilotForAllOrgs } from "@repo/database";
import { logger } from "@repo/logs";

let started = false;

export function startAutopilotScheduler() {
	if (started || process.env.NODE_ENV === "test") {
		return;
	}
	started = true;

	const intervalMs = Number(process.env.AUTOPILOT_INTERVAL_MS ?? 5 * 60 * 1000);

	logger.info(`Autopilot scheduler starting (interval ${intervalMs}ms)`);

	setInterval(() => {
		runAutopilotForAllOrgs().catch((err) => {
			logger.error("Autopilot scheduler tick failed", err);
		});
	}, intervalMs);
}
