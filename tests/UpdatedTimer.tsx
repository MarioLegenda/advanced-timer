// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, {useEffect, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import useAdvancedInterval from '../src';

export default function UpdatedTimer() {
	const [exitCalled, setExitCalled] = useState(false);
	const [restartCalled, setRestartCalled] = useState(false);

	const [numOfElapsed, setNumOfElapsed] = useState(0);

	const [exit, restart, updateProps, info] = useAdvancedInterval({
		onExit() {
			setExitCalled(true);
		},
		onElapsed() {
			setNumOfElapsed((num) => num + 1);
		},
		onRestart() {
			setRestartCalled(true);
		},
		maxTicks: 5,
		interval: 100,
	});

	useEffect(() => {
		setTimeout(() => {
			exit();
			updateProps(1000, 2);
			restart();
		}, 2100);
	}, []);

	useEffect(() => {
		setTimeout(() => {
			exit();
		}, 5000);
	}, []);

	return <div>
		<p id="ticks">{info().totalTicks}</p>
		<p id="elapsed">{numOfElapsed}</p>
		<p id="exit">{info().numOfExits}</p>
		<p id="restarts">{info().numOfRestarts}</p>

		<p id="exitCalled">{exitCalled ? 'yes' : 'no'}</p>
		<p id="restartCalled">{restartCalled ? 'yes' : 'no'}</p>
	</div>;
};