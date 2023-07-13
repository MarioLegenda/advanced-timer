// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, {useEffect, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import useAdvancedTimer from '../src';

export default function RestartTimer() {
	const [exitCalled, setExitCalled] = useState(false);
	const [restartCalled, setRestartCalled] = useState(false);

	const [exit,restart,, info] = useAdvancedTimer({
		onExit() {
			setExitCalled(true);
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
			restart();
		}, 5200);

		setTimeout(() => {
			exit();
		}, 5500);
	});

	return <div>
		<p id="ticks">{info().totalTicks}</p>
		<p id="elapsed">{info().numOfElapsed}</p>
		<p id="exit">{info().numOfExits}</p>
		<p id="restarts">{info().numOfRestarts}</p>

		<p id="exitCalled">{exitCalled ? 'yes' : 'no'}</p>
		<p id="restartCalled">{restartCalled ? 'yes' : 'no'}</p>
	</div>;
};