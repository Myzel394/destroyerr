import { EventSource } from "eventsource";
import { ENV } from "./envs";

let eventSource: EventSource | null = null;

export function main() {
	console.info(`Starting in environment: ${process.env.NODE_ENV}`);
	eventSource = new EventSource(ENV.NTFY_URL);

	console.info("EventSource created, listening for messages...");

	eventSource.onmessage = (event) => {
		console.log(event, event.data);
	};

	eventSource.onerror = (error) => {
		console.error("EventSource error:", error);
	};

	eventSource.onopen = () => {
		console.info("EventSource connection opened.");
	};
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
