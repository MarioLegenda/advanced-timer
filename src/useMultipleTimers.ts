import {useCallback, useEffect, useRef} from 'react';
import type {
	ExitOrRestartFn,
	InfoWithNameFn, MultipleTimerInfo, MultipleTimersOption,
	NameValue,
	UpdatePropsWithNameFn,
	UseMultipleTimers,
	VoidWithNameFn
} from './types';

export function useMultipleTimers(options: UseMultipleTimers): [ExitOrRestartFn, ExitOrRestartFn, UpdatePropsWithNameFn, InfoWithNameFn] {
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

	const updateProps = useCallback((name: string, interval: number, maxTicks: number) => {
		if (immutableOptions.current && immutableOptions.current.intervals) {
			const intervals = immutableOptions.current?.intervals;
			for (const option of intervals) {
				if (option.name === name) {
					option.maxTicks = maxTicks;
					option.interval = interval;
					break;
				}
			}
		}
	}, [subscriberRef.current]);

	useEffect(() => run(), [immutableOptions.current]);

	useEffect(() => {
		if (!immutableOptions.current) {
			immutableOptions.current = options;
		}
	}, []);

	return [exit, (name?: string) => restart(name, true), updateProps, info];
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
