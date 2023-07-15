export interface UseMultipleTimers {
	intervals: {
		name: string;
		maxTicks: number;
		interval: number;
	}[];
	onTick?(name: string): void;
	onExit?(name: string): void;
	onElapsed?(name: string): void;
	onRestart?(name: string): void;
}
export interface MultipleTimersOption {
	name: string;
	maxTicks: number;
	interval: number;
	onTick?(name: string): void;
	onExit?(name: string): void;
	onElapsed?(name: string): void;
	onRestart?(name: string): void;
}
export interface UseAdvancedTimer {
	maxTicks: number;
	interval: number;
	onTick?(): void;
	onExit?(): void;
	onElapsed?(): void;
	onRestart?(): void;
}
export interface TimerInfo {
	totalTicks: number;
	numOfRestarts: number;
	numOfElapsed: number;
	numOfExits: number;
}

export interface MultipleTimerInfo {
	totalTicks: Record<string, number>;
	numOfRestarts: Record<string, number>;
	numOfElapsed: Record<string, number>;
	numOfExits: Record<string, number>;
}

export interface NameValue<T> {
	[key: string]: {
		name: string;
		value: T;
	}
}

export type VoidFn = () => void;
export type InfoFn = () => TimerInfo;
export type UpdatePropsFn = (interval: number, maxTicks: number) => void;

export type VoidWithNameFn = (name: string) => void;
export type ExitOrRestartFn = (name?: string) => void;
export type InfoWithNameFn = () => MultipleTimerInfo;
export type UpdatePropsWithNameFn = (name: string, interval: number, maxTicks: number) => void;