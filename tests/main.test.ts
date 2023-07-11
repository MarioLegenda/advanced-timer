import useInterval from '../src';

test('should use counter', () => {
	useInterval({
		onStop() {
		},
		onQuit() {
		},
		onInterval() {
		}
	});
});