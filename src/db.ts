export class DB {
	private lastData: string | null = null;

	constructor() {}

	private writeToDb(data: string): void {
		console.debug("Writing to DB");

		this.lastData = data;
	}

	private readFromDb(): string | null {
		console.debug("Reading from DB");

		return this.lastData;
	}

	writeCurrentTime(): void {
		const newData = {
			currentTime: Date.now(),
		};

		this.writeToDb(JSON.stringify(newData));
	}

	getLastTime(): Date | null {
		const data = this.readFromDb();
		if (!data) {
			return null;
		}

		try {
			const parsedData = JSON.parse(data);
			const time = parsedData.currentTime;

			if (typeof time !== "number") {
				return null;
			}

			return new Date(time);
		} catch (error) {
			console.error("Error parsing DB data:", error);
			return null;
		}
	}
}
