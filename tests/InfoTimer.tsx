import React from 'react';
import useAdvancedInterval from '../src';

export default function InfoTimer() {
	const [exit,,, info] = useAdvancedInterval({
		onTick() {
			// skip
		},
		onElapsed() {
			exit();
			// skip
		},
		onExit() {
			// skip
		},
		onRestart() {
			// skip
		},
		maxTicks: 5,
		interval: 1000,
	});

	return <div>
		<p id="ticks">{info().totalTicks}</p>
	</div>;
};