import {useCallback, useEffect, useRef} from 'react';

interface UseMultipleTimers {
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
interface MultipleTimersOption {
	name: string;
	maxTicks: number;
	interval: number;
	onTick?(name: string): void;
	onExit?(name: string): void;
	onElapsed?(name: string): void;
	onRestart?(name: string): void;
}
interface UseAdvancedTimer {
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

interface MultipleTimerInfo {
	totalTicks: Record<string, number>;
	numOfRestarts: Record<string, number>;
	numOfElapsed: Record<string, number>;
	numOfExits: Record<string, number>;
}

interface NameValue<T> {
	[key: string]: {
		name: string;
		value: T;
	}
}

type VoidFn = () => void;
type InfoFn = () => TimerInfo;
type UpdatePropsFn = (interval: number, maxTicks: number) => void;

type VoidWithNameFn = (name: string) => void;
type ExitOrRestartFn = (name?: string) => void;
type InfoWithNameFn = () => MultipleTimerInfo;
type UpdatePropsWithNameFn = (name: string, interval: number, maxTicks: number) => void;

export function useAdvancedTimer({
	onTick,
	onExit,
	onElapsed,
	onRestart,
	maxTicks,
	interval,
}: UseAdvancedTimer): [VoidFn, VoidFn, UpdatePropsFn, InfoFn] {
	/**
	 * Used to store return value of setInterval() so that it can be cleared but immutable.
	 */
	const subscriberRef = useRef<NodeJS.Timer | null>(null);
	/**
	 * Holder for maxTicks so that it remains immutable
	 */
	const maxTicksRef = useRef(maxTicks);
	/**
	 * Holder for the interval so that it remains immutable
	 */
	const intervalRef = useRef(interval);

	const numOfRestarts = useRef(0);
	const numOfElapsed = useRef(0);
	const numOfExits = useRef(0);
	const totalTicks = useRef(0);

	const numOfRepeatsRef = useRef(0);

	const startInterval = useCallback(() => {
		subscriberRef.current = setInterval(() => {
			sendAsync(onTick);
			numOfRepeatsRef.current = numOfRepeatsRef.current + 1;
			totalTicks.current = totalTicks.current + 1;

			if (numOfRepeatsRef.current === maxTicksRef.current) {
				sendAsync(onElapsed);
				numOfElapsed.current = numOfElapsed.current + 1;
				restart(false);
			}
		}, intervalRef.current);
	}, []);

	const info = useCallback((): TimerInfo => ({
		numOfElapsed: numOfElapsed.current,
		numOfExits: numOfExits.current,
		numOfRestarts: numOfRestarts.current,
		totalTicks: totalTicks.current,
	}), [numOfRestarts.current, numOfElapsed.current, numOfExits.current, totalTicks.current]);

	const exit = useCallback(() => {
		if (subscriberRef.current) {
			clearInterval(subscriberRef.current);
			subscriberRef.current = null;
			numOfRepeatsRef.current = 0;
		}

		numOfExits.current = numOfExits.current + 1;

		sendAsync(onExit);
	}, [subscriberRef.current, numOfExits.current]);

	const restart = useCallback((callOnRestart?: boolean) => {
		if (subscriberRef.current) clearInterval(subscriberRef.current);

		numOfRepeatsRef.current = 0;

		startInterval();

		if (callOnRestart) {
			sendAsync(onRestart);
			numOfRestarts.current = numOfRestarts.current + 1;
		}
	}, []);

	const updateProps = useCallback((interval: number, maxTicks: number) => {
		if (subscriberRef.current) throw new Error('Props cannot be updated while the timer is running. Call exit() before this function and then restart() after it.');

		intervalRef.current = interval;
		maxTicksRef.current = maxTicks;
	}, [subscriberRef.current]);

	const sendAsync = useCallback(async (fn?: VoidFn) => fn?.(), []);

	/**
	 * Start the initial interval. Only called once. All subsequent timers should be created trough
	 * restart().
	 */
	useEffect(() => {
		startInterval();
	}, []);
	/**
	 * On startup, just in case, clear subscribing interval if an interval is running so we
	 * have a clean initial state.
	 */
	useEffect(
		() => () => {
			if (subscriberRef.current) clearInterval(subscriberRef.current);
		},
		[],
	);

	return [exit, () => restart(true), updateProps, info];
}
export function useMultipleTimers(options: UseMultipleTimers): [ExitOrRestartFn, ExitOrRestartFn, InfoWithNameFn] {
	const immutableOptions = useRef<UseMultipleTimers | null>(null);
	const subscriberRef = useRef<NameValue<NodeJS.Timer>>({});
	const maxTicksRef = useRef<NameValue<number>>({});
	const intervalRef = useRef<NameValue<number>>({});

	const numOfRestarts = useRef<NameValue<number>>({});
	const numOfElapsed = useRef<NameValue<number>>({});
	const numOfExits = useRef<NameValue<number>>({});
	const totalTicks = useRef<NameValue<number>>({});

	const numOfRepeatsRef = useRef<NameValue<number>>({});

	const sendAsync = useCallback(async (name: string, fn?: VoidWithNameFn) => fn?.(name), []);

	const run = useCallback(() => {
		if (immutableOptions.current) {
			for (const option of immutableOptions.current.intervals) {
				maxTicksRef.current = initAndAssign<number>(maxTicksRef.current, option.name, () => option.maxTicks);
				intervalRef.current = initAndAssign<number>(intervalRef.current, option.name, () => option.interval);
			}

			for (const option of immutableOptions.current.intervals) {
				startInterval(option.name, option.interval, immutableOptions.current.onTick, immutableOptions.current.onElapsed);
			}
		}
	}, []);

	const exitSingle = useCallback((name: string) => {
		clearInterval(subscriberRef.current[name].value);
		delete subscriberRef.current[name];
		numOfRepeatsRef.current = initAndAssign<number>(numOfRepeatsRef.current, name, () => 0);
		numOfExits.current = initAndAssign<number>(numOfExits.current, name, (current) => current as number + 1);

		const option = findOption(name, options.intervals);
		if (option) {
			sendAsync(name, option?.onExit);
		}
	}, []);

	const exitAll = useCallback(() => {
		const names = Object.keys(subscriberRef.current);

		for (const name of names) {
			exitSingle(name);
		}
	}, []);

	const restartSingle = useCallback((name: string, callOnRestart?: boolean) => {
		if (subscriberRef.current[name]) clearInterval(subscriberRef.current[name].value);

		numOfRepeatsRef.current = initAndAssign<number>(numOfRepeatsRef.current, name, () => 0);

		const option = findOption(name, options.intervals);
		if (option) {
			startInterval(option.name, option.interval, options.onTick, options.onElapsed);
		}

		if (callOnRestart) {
			sendAsync(name, option?.onRestart);
			numOfRestarts.current = initAndAssign<number>(numOfRestarts.current as NameValue<number>, name, () => 0);
		}
	}, []);

	const startInterval = useCallback((name: string, interval: number, onTick?: VoidWithNameFn, onElapsed?: VoidWithNameFn) => {
		const clear = setInterval(() => {
			sendAsync(name, onTick);
			numOfRepeatsRef.current = initAndAssign<number>(numOfRepeatsRef.current, name, (current) => current as number + 1);
			totalTicks.current = initAndAssign<number>(totalTicks.current, name, (current) => current as number + 1);

			const numOfRepeats = numOfRepeatsRef.current[name];
			const maxTicks = maxTicksRef.current[name];

			if (numOfRepeats.value === maxTicks.value) {
				sendAsync(name, onElapsed);
				numOfElapsed.current = initAndAssign<number>(numOfElapsed.current as NameValue<number>, name, (current) => current as number + 1);
				numOfRepeatsRef.current = initAndAssign<number>(numOfRepeatsRef.current, name, () => 0);
			}
		}, interval);

		subscriberRef.current = initAndAssign<NodeJS.Timer>(subscriberRef.current, name, () => clear);
	}, [maxTicksRef.current]);

	const restart = useCallback((name?: string, callOnRestart?: boolean) => {
		if (!name) run();
		if (name) restartSingle(name, callOnRestart);
	}, []);

	const exit = useCallback((name?: string) => {
		if (!name) exitAll();
		if (name && subscriberRef.current[name]) exitSingle(name);
	}, [subscriberRef.current, numOfExits.current]);

	const info = useCallback((): MultipleTimerInfo => ({
		numOfElapsed: processInfo(numOfElapsed.current),
		numOfExits: processInfo(numOfExits.current),
		numOfRestarts: processInfo(numOfRestarts.current),
		totalTicks: processInfo(totalTicks.current),
	}), [numOfRestarts.current, numOfElapsed.current, numOfExits.current, totalTicks.current]);

	/*	const updateProps = useCallback((name: string, interval: number, maxTicks: number) => {
		if (subscriberRef.current) throw new Error('Props cannot be updated while the timer is running. Call exit() before this function and then restart() after it.');

		intervalRef.current = interval;
		maxTicksRef.current = maxTicks;
	}, [subscriberRef.current]);*/

	useEffect(() => run(), [immutableOptions.current]);

	useEffect(() => {
		if (!immutableOptions.current) {
			immutableOptions.current = options;
		}
	}, []);

	return [exit, (name?: string) => restart(name, true), info];
}
function findOption(name: string, options: MultipleTimersOption[]): MultipleTimersOption | undefined {
	return options.find(option => option.name === name);
}
function initAndAssign<T>(collection: NameValue<T>, name: string, callback: (current: T | null) => T): NameValue<T> {
	if (!collection[name]) {
		collection[name] = {
			name: name,
			value: callback(null),
		};

		return collection;
	}

	const value = collection[name];
	value.value = callback(value.value);

	return collection;
}
function processInfo(value: NameValue<number>): Record<string, number> {
	const keys = Object.keys(value);
	const returnObj: Record<string, number> = {};

	for (const key of keys) {
		const val = value[key];
		returnObj[val.name] = val.value;
	}

	return returnObj;
}
