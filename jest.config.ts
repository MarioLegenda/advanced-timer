export {};
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	'testEnvironment': 'jsdom',
	'transform': {
		'^.+\\.tsx?$': 'ts-jest'
	},
	'setupFilesAfterEnv': [
		'@testing-library/jest-dom/extend-expect'
	]
};