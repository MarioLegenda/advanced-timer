import {render, cleanup, waitFor, queryByAttribute} from '@testing-library/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import InfoTimer from './InfoTimer';
import RestartTimer from './RestartTimer';
import UpdatedTimer from './UpdatedTimer';

afterEach(cleanup);

test('should print correct info', async () => {
	const dom = render(
		<InfoTimer />,
	);

	await waitFor(() => {
		const elements: Record<string, string> = {
			elapsed: '1',
			exit: '1',
			ticks: '5',
			restarts: '0',
		};

		const keys = Object.keys(elements);

		for (const key of keys) {
			const el = queryByAttribute('id', dom.container, key);
			expect(el).toBeInTheDocument();
			expect(el).toBeTruthy();

			if (el) {
				expect(el.textContent).toBe(elements[key]);
			}
		}
	}, {
		timeout: 1000,
		interval: 0,
	});
}, 10000);

test('should print correct info and call all callbacks', async () => {
	const dom = render(
		<RestartTimer />,
	);

	await waitFor(() => {
		const elements: Record<string, string> = {
			elapsed: '10',
			exit: '1',
			ticks: '51',
			restarts: '1',
		};

		const keys = Object.keys(elements);

		for (const key of keys) {
			const el = queryByAttribute('id', dom.container, key);
			expect(el).toBeInTheDocument();
			expect(el).toBeTruthy();

			if (el) {
				expect(el.textContent).toBe(elements[key]);
			}
		}

		const exitCalledEl = queryByAttribute('id', dom.container, 'exitCalled');
		expect(exitCalledEl).toBeTruthy();
		if (exitCalledEl) {
			expect(exitCalledEl.textContent).toBe('yes');
		}

		const restartCalledEl = queryByAttribute('id', dom.container, 'restartCalled');
		expect(restartCalledEl).toBeTruthy();
		if (restartCalledEl) {
			expect(restartCalledEl.textContent).toBe('yes');
		}

	}, {
		timeout: 7000,
		interval: 0,
	});
}, 10000);

test('should print correct info and update props in the middle of a running timer', async () => {
	const dom = render(
		<UpdatedTimer />,
	);

	await waitFor(() => {
		const elements: Record<string, string> = {
			elapsed: '5',
			ticks: '22',
			restarts: '1',
		};

		const keys = Object.keys(elements);

		for (const key of keys) {
			const el = queryByAttribute('id', dom.container, key);
			expect(el).toBeInTheDocument();
			expect(el).toBeTruthy();

			if (el) {
				expect(el.textContent).toBe(elements[key]);
			}
		}

		const exitCalledEl = queryByAttribute('id', dom.container, 'exitCalled');
		expect(exitCalledEl).toBeTruthy();
		if (exitCalledEl) {
			expect(exitCalledEl.textContent).toBe('yes');
		}

		const restartCalledEl = queryByAttribute('id', dom.container, 'restartCalled');
		expect(restartCalledEl).toBeTruthy();
		if (restartCalledEl) {
			expect(restartCalledEl.textContent).toBe('yes');
		}
	}, {
		timeout: 7000,
		interval: 0,
	});
}, 10000);