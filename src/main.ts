import { EventSource } from "eventsource";
import { ENV } from "./envs";
import { DB } from "./db";
import { NTFYMessage } from "./types";
import { exec } from "child_process";

let eventSource: EventSource | null = null;
const db = new DB();

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
			}
		}
	};

	eventSource.onerror = (error) => {
		console.error("EventSource error:", error);
	};

	eventSource.onopen = () => {
		console.info("EventSource connection opened.");
	};

	db.writeCurrentTime();

	setInterval(() => {
		console.info("Checking for timeout");

		const lastTime = db.getLastTime();

		if (!lastTime) {
			console.warn("No last time found in DB, skipping timeout check.");
			return;
		}

		const diff = Date.now() - lastTime.getTime();

		if (diff >= ENV.DESTROY_TIMEOUT * 1_000) {
			console.warn(`Timeout reached! Executing command: ${ENV.SH_COMMAND}`);

			exec(ENV.SH_COMMAND, (error, stdout, stderr) => {
				if (error) {
					console.error("Error executing command:", error);
					return;
				}

				console.info("Command executed successfully:", stdout);

				// Reset
				db.writeCurrentTime();
			});
		} else {
			console.info(
				`No timeout reached. Time since last message: ${diff / 1000} seconds`,
			);
		}
	}, ENV.CHECK_INTERVAL * 1_000);
}

process.on("SIGINT", () => {
	console.log("SIGINT received, closing EventSource...");
	if (eventSource) {
		eventSource.close();
		console.log("EventSource closed.");
	}
	process.exit(0);
});
process.on("SIGTERM", () => {
	console.log("SIGTERM received, closing EventSource...");
	if (eventSource) {
		eventSource.close();
		console.log("EventSource closed.");
	}
	process.exit(0);
});
