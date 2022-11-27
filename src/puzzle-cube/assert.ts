class AssertionError extends Error {
	name = 'AssertionError'

	constructor(message = 'Assertion Error') {
		super(message)
	}
}

export function assert(condition: boolean, message?: string, ...rest: any): asserts condition {
	if (!condition) {
		console.error(...rest)
		throw new AssertionError(message)
	}
}
