// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {useAdvancedTimer} from '../src';

export default function InfoTimer() {
	const [numOfElapsed, setNumOfElapsed] = useState(0);

	const [exit,,, info] = useAdvancedTimer({
		onElapsed() {
			setNumOfElapsed(num => num + 1);
			exit();
		},
		maxTicks: 5,
		interval: 100,
	});

	return <div>
		<p id="ticks">{info().totalTicks}</p>
		<p id="elapsed">{numOfElapsed}</p>
		<p id="exit">{info().numOfExits}</p>
		<p id="restarts">{info().numOfRestarts}</p>
	</div>;
};