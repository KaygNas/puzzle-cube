import { vec3 } from 'gl-matrix'
import { Cube } from './cube'

const center = vec3.fromValues

export const cubes: Cube[] = [
	// tier 1
	new Cube(center(-1, -1, -1), ['back', 'down', 'left']),
	new Cube(center(0, -1, -1), ['back', 'down']),
	new Cube(center(1, -1, -1), ['back', 'down', 'right']),

	new Cube(center(-1, -1, 0), ['down', 'left']),
	new Cube(center(0, -1, 0), ['down']),
	new Cube(center(1, -1, 0), ['down', 'right']),

	new Cube(center(-1, -1, 1), ['front', 'down', 'left']),
	new Cube(center(0, -1, 1), ['front', 'down']),
	new Cube(center(1, -1, 1), ['front', 'down', 'right']),

	// tier 2
	new Cube(center(-1, 0, -1), ['back', 'left']),
	new Cube(center(0, 0, -1), ['back']),
	new Cube(center(1, 0, -1), ['back', 'right']),

	new Cube(center(-1, 0, 0), ['left']),
	new Cube(center(0, 0, 0), []),
	new Cube(center(1, 0, 0), ['right']),

	new Cube(center(-1, 0, 1), ['front', 'left']),
	new Cube(center(0, 0, 1), ['front']),
	new Cube(center(1, 0, 1), ['front', 'right']),

	// tier 3
	new Cube(center(-1, 1, -1), ['back', 'up', 'left']),
	new Cube(center(0, 1, -1), ['back', 'up']),
	new Cube(center(1, 1, -1), ['back', 'up', 'right']),

	new Cube(center(-1, 1, 0), ['up', 'left']),
	new Cube(center(0, 1, 0), ['up']),
	new Cube(center(1, 1, 0), ['up', 'right']),

	new Cube(center(-1, 1, 1), ['front', 'up', 'left']),
	new Cube(center(0, 1, 1), ['front', 'up']),
	new Cube(center(1, 1, 1), ['front', 'up', 'right']),
]
