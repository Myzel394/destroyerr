type Data = {
	currentTime: number;
	diff: number;
};

export class DB {
	private lastData: Data;

	constructor() {
		this.lastData = {
			currentTime: Date.now(),
			diff: 0,
		};
	}

	resetDiff(): void {
		console.debug("Resetting diff in DB");

		this.lastData.diff = 0;
	}

	writeCurrentTime(): void {
		this.lastData.currentTime = Date.now();
	}

	getLastTime(): Date {
		return new Date(this.lastData.currentTime);
	}

	addDiff(diff: number): void {
		console.debug("Adding diff to DB:", diff);

		this.lastData.diff += diff;
	}

	getDiff(): number {
		return this.lastData.diff;
	}
}
