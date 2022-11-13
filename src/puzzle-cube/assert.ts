class AssertionError extends Error {
	name = 'AssertionError'

	constructor(message = 'Assertion Error') {
		super(message)
	}
}

export function assert(condition: boolean, message?: string): asserts condition {
	if (!condition) throw new AssertionError(message)
}
