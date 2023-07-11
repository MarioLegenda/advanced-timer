import { useEffect, useRef, useState } from 'react';

export default function useInterval({
	onInterval,
	onQuit,
	onStop,
	repeatInterval,
	maxInterval,
	restart,
	stop,
	quit,
}: UseInterval) {
	const subscriberRef = useRef<NodeJS.Timer | null>(null);
	const stopRef = useRef(false);
	const [numOfRepeats, setNumOfRepeats] = useState<number>(0);

	useEffect(
		() => () => {
			if (subscriberRef.current) clearInterval(subscriberRef.current);
		},
		[],
	);

	useEffect(() => {
		if (numOfRepeats === maxInterval) {
			if (subscriberRef.current) {
				clearInterval(subscriberRef.current);
				onQuit();
			}
		}
	}, [numOfRepeats, maxInterval]);

	useEffect(() => {
		if (quit) {
			if (subscriberRef.current) {
				clearInterval(subscriberRef.current);
			}

			onQuit();
		}
	}, [quit]);

	useEffect(() => {
		if (stop) {
			stopRef.current = true;
			if (subscriberRef.current) clearInterval(subscriberRef.current);

			onStop();
		}
	}, [stop]);

	useEffect(() => {
		if (stopRef.current) {
			if (subscriberRef.current) clearInterval(subscriberRef.current);
			return;
		}

		setNumOfRepeats(0);

		subscriberRef.current = setInterval(() => {
			onInterval();
			setNumOfRepeats((num) => num + 1);
		}, repeatInterval);
	}, [restart]);
}
