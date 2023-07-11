export {};
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: 'ts-jest',
	// to obtain access to the matchers.
	setupFilesAfterEnv: ['./tests/setupTests.ts'],

	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	modulePaths: ['<rootDir>'],
	testEnvironment: 'jsdom',
};