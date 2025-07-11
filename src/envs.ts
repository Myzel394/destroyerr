import z from "zod";
import * as inSeconds from "in-seconds";

const ENV_SCHEMA = z.object({
	NTFY_URL: z.string().url(),
	// Every `CHECK_INTERVAL` seconds, the server will check the current status
	CHECK_INTERVAL: z.coerce
		.number()
		.int()
		.min(1)
		.max(inSeconds.hours(48))
		.default(inSeconds.minutes(5)),
	// Once `DESTROY_TIMEOUT` seconds have passed since last message, the command will be executed
	DESTROY_TIMEOUT: z.coerce
		.number()
		.int()
		.min(10)
		.max(inSeconds.days(30))
		.default(inSeconds.hours(2)),
	// The command to execute when the timeout is reached
	SH_COMMAND: z
		.string()
		.default("echo 'No messages received; Timeout reached!'"),
});

export function loadEnv(): z.infer<typeof ENV_SCHEMA> {
	const env = ENV_SCHEMA.safeParse(process.env);

	if (!env.success) {
		console.error("Invalid environment variables:", env.error.format());
		process.exit(1);
	}

	return env.data;
}

export const ENV = loadEnv();
