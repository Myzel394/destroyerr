import { ErrorEvent, EventSource } from "eventsource";
import { ENV } from "./envs";
import { DB } from "./db";
import { NTFYMessage } from "./types";
import { exec } from "child_process";

let eventSource: EventSource | null = null;
const db = new DB();
let paused = false;

export function main() {
	console.info(`Starting in environment: ${process.env.NODE_ENV}`);
	console.info(`Using NTFY URL: ${ENV.NTFY_URL}`);
	console.info(`Check interval: ${ENV.CHECK_INTERVAL} seconds`);
	console.info(`Destroy timeout: ${ENV.DESTROY_TIMEOUT} seconds`);
	eventSource = new EventSource(ENV.NTFY_URL);

	console.info("EventSource created, listening for messages...");

	eventSource.onmessage = (event) => {
		console.debug("New message received");

		const ntfyMessage = JSON.parse(event.data) as NTFYMessage;

		if (ntfyMessage.event === "message" && ntfyMessage.title === "destroyerr") {
			if (ntfyMessage.message === "keep-alive") {
				db.writeCurrentTime();
				db.resetDiff();
			}
		}
	};

	eventSource.onerror = (error) => {
		console.error("EventSource error:", error);

		// Check if server is unreachable
		if (
			error instanceof ErrorEvent &&
			error.message?.includes("ECONNREFUSED")
		) {
			console.warn("NTFY server is unreachable.");

			switch (ENV.NTFY_SERVER_UNREACHABLE) {
				case "continue":
					console.debug("Ignoring error and continuing.");
					break;
				case "pause":
					console.debug("Pausing EventSource connection.");
					paused = true;
					break;
				case "run_command":
					console.info(`Running command: ${ENV.SH_COMMAND}`);

					exec(ENV.SH_COMMAND, (error) => {
						if (error) {
							console.error("Error executing command:", error);
							return;
						}

						stop();
					});
					break;
			}
		}
	};

	eventSource.onopen = () => {
		console.info("EventSource connection opened.");

		// Reset pause state
		paused = false;
	};

	db.writeCurrentTime();

	setInterval(() => {
		console.info("Checking for timeout");

		if (paused) {
			console.info("EventSource is paused, skipping timeout check.");
			db.writeCurrentTime();
			return;
		}

		const lastTime = db.getLastTime();

		if (!lastTime) {
			console.warn("No last time found in DB, skipping timeout check.");
			return;
		}

		const diff = Date.now() - lastTime.getTime();

		db.addDiff(diff);
		db.writeCurrentTime();

		if (db.getDiff() >= ENV.DESTROY_TIMEOUT * 1_000) {
			console.warn(`Timeout reached! Executing command: ${ENV.SH_COMMAND}`);

			exec(ENV.SH_COMMAND, (error) => {
				if (error) {
					console.error("Error executing command:", error);
					return;
				}

				stop();
			});
		} else {
			console.info(
				`No timeout reached. Time since last message: ${db.getDiff() / 1000} seconds`,
			);
		}
	}, ENV.CHECK_INTERVAL * 1_000);
}

function stop() {
	console.info("Stopping destroyerr");

	if (eventSource) {
		eventSource.close();
	}

	process.exit(0);
}

process.on("SIGINT", () => {
	console.info("SIGINT received");
	stop();
});
process.on("SIGTERM", () => {
	console.info("SIGTERM received, closing EventSource...");
	stop();
});
