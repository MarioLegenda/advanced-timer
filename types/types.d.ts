interface UseInterval {
	repeatInterval: number;
	maxInterval: number;
	stop: boolean;
	quit: boolean;
	restart: boolean;
	onInterval(): void;
	onQuit(): void;
	onStop(): void;
}
