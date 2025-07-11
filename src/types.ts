export type NTFYMessage = {
	id: string;
	time: number;
	expires: number;
	event: "message";
	topic: string;
	message: string;
	title?: string;
};
