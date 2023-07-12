interface UseAdvancedInterval {
	maxTicks: number;
	interval: number;
	onTick?(): void;
	onExit?(): void;
	onElapsed?(): void;
	onRestart?(): void;
}
interface TimerInfo {
	totalTicks: number;
	numOfRestarts: number;
	numOfElapsed: number;
	numOfExits: number;
}

type VoidFn = () => void;
type InfoFn = () => TimerInfo;
type UpdatePropsFn = (interval: number, maxTicks: number) => void;

