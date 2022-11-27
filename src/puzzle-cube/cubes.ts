import { vec3 } from 'gl-matrix'
import { Cube } from './cube'
import { PuzzleCude } from './puzzle-cube'

export function createCubesFor(puzzleCube: PuzzleCude) {
  const center = vec3.fromValues
  return [
    // tier 1
    new Cube(center(-1, -1, -1), ['back', 'down', 'left'], puzzleCube),
    new Cube(center(0, -1, -1), ['back', 'down'], puzzleCube),
    new Cube(center(1, -1, -1), ['back', 'down', 'right'], puzzleCube),

    new Cube(center(-1, -1, 0), ['down', 'left'], puzzleCube),
    new Cube(center(0, -1, 0), ['down'], puzzleCube),
    new Cube(center(1, -1, 0), ['down', 'right'], puzzleCube),

    new Cube(center(-1, -1, 1), ['front', 'down', 'left'], puzzleCube),
    new Cube(center(0, -1, 1), ['front', 'down'], puzzleCube),
    new Cube(center(1, -1, 1), ['front', 'down', 'right'], puzzleCube),

    // tier 2
    new Cube(center(-1, 0, -1), ['back', 'left'], puzzleCube),
    new Cube(center(0, 0, -1), ['back'], puzzleCube),
    new Cube(center(1, 0, -1), ['back', 'right'], puzzleCube),

    new Cube(center(-1, 0, 0), ['left'], puzzleCube),
    new Cube(center(0, 0, 0), [], puzzleCube),
    new Cube(center(1, 0, 0), ['right'], puzzleCube),

    new Cube(center(-1, 0, 1), ['front', 'left'], puzzleCube),
    new Cube(center(0, 0, 1), ['front'], puzzleCube),
    new Cube(center(1, 0, 1), ['front', 'right'], puzzleCube),

    // tier 3
    new Cube(center(-1, 1, -1), ['back', 'up', 'left'], puzzleCube),
    new Cube(center(0, 1, -1), ['back', 'up'], puzzleCube),
    new Cube(center(1, 1, -1), ['back', 'up', 'right'], puzzleCube),

    new Cube(center(-1, 1, 0), ['up', 'left'], puzzleCube),
    new Cube(center(0, 1, 0), ['up'], puzzleCube),
    new Cube(center(1, 1, 0), ['up', 'right'], puzzleCube),

    new Cube(center(-1, 1, 1), ['front', 'up', 'left'], puzzleCube),
    new Cube(center(0, 1, 1), ['front', 'up'], puzzleCube),
    new Cube(center(1, 1, 1), ['front', 'up', 'right'], puzzleCube),
  ]
}