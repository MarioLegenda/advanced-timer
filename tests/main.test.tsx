import {render, cleanup, waitFor, queryByAttribute} from '@testing-library/react';
import React from 'react';
import InfoTimer from './InfoTimer';

afterEach(cleanup);

test('should use counter', async () => {
	const dom = render(
		<InfoTimer />,
	);

	const getById = queryByAttribute.bind(null, 'id');

	await waitFor(() => {
		const el = queryByAttribute('id', dom.container, 'ticks');
		expect(el).toBeInTheDocument();
		expect(el).toBeTruthy();

		if (el) {
			expect(el.textContent).toBe('5');
		}
	}, {
		timeout: 6000,
		interval: 0,
	});
}, 10000);