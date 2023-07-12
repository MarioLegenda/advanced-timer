import {useCallback, useEffect, useRef, useState} from 'react';

export default function useAdvancedInterval({
	onTick,
	onExit,
	onElapsed,
	onRestart,
	maxTicks,
	interval,
}: UseAdvancedInterval): [VoidFn, VoidFn, UpdatePropsFn, InfoFn] {
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

	const [numOfRepeats, setNumOfRepeats] = useState<number>(0);

	const startInterval = useCallback(() => {
		subscriberRef.current = setInterval(() => {
			sendAsync(onTick);
			setNumOfRepeats((num) => num + 1);
			totalTicks.current = totalTicks.current + 1;
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
			setNumOfRepeats(0);

			numOfExits.current = numOfExits.current + 1;
		}

		sendAsync(onExit);
	}, [subscriberRef.current]);

	const restart = useCallback((callOnRestart?: boolean) => {
		if (subscriberRef.current) clearInterval(subscriberRef.current);

		setNumOfRepeats(0);

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

	const sendAsync = useCallback(async (fn: VoidFn) => fn(), []);

	/**
	 * Start the initial interval. Only called once. All subsequent timers should be created trough
	 * restart().
	 */
	useEffect(() => {
		startInterval();
	}, []);

	useEffect(() => {
		if (numOfRepeats === maxTicksRef.current) {
			if (subscriberRef.current) {
				sendAsync(onElapsed);
				restart(false);
				numOfElapsed.current = numOfElapsed.current + 1;
			}
		}
	}, [numOfRepeats, restart]);

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
