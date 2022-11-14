import { vec3 } from 'gl-matrix'
import { Cube } from './cube'

const center = vec3.fromValues

export const cubes: Cube[] = [
  // tier 1
  new Cube({ back: 'red', down: 'green', left: 'blue', }, center(-1, -1, -1)),
  new Cube({ back: 'red', down: 'green', }, center(0, -1, -1)),
  new Cube({ back: 'red', down: 'green', right: 'purple', }, center(1, -1, -1)),

  new Cube({ back: 'red', left: 'blue', }, center(-1, 0, -1)),
  new Cube({ back: 'red', }, center(0, 0, -1)),
  new Cube({ back: 'red', right: 'purple', }, center(1, 0, -1)),

  new Cube({ back: 'red', up: 'white', left: 'blue', }, center(-1, 1, -1)),
  new Cube({ back: 'red', up: 'white', }, center(0, 1, -1)),
  new Cube({ back: 'red', up: 'white', right: 'purple', }, center(1, 1, -1)),

  // tier 2
  new Cube({ down: 'green', left: 'blue', }, center(-1, -1, 0)),
  new Cube({ down: 'green', }, center(0, -1, 0)),
  new Cube({ down: 'green', right: 'purple', }, center(1, -1, 0)),

  new Cube({ left: 'blue', }, center(-1, 0, 0)),
  new Cube({ front: 'yellow', back: 'red', up: 'white', down: 'green', left: 'blue', right: 'purple' }, center(0, 0, 0)),
  new Cube({ right: 'purple', }, center(1, 0, 0)),

  new Cube({ up: 'white', left: 'blue', }, center(-1, 1, 0)),
  new Cube({ up: 'white', }, center(0, 1, 0)),
  new Cube({ up: 'white', right: 'purple', }, center(1, 1, 0)),

  // tier 3
  new Cube({ front: 'yellow', down: 'green', left: 'blue', }, center(-1, -1, 1)),
  new Cube({ front: 'yellow', down: 'green', }, center(0, -1, 1)),
  new Cube({ front: 'yellow', down: 'green', right: 'purple', }, center(1, -1, 1)),

  new Cube({ front: 'yellow', left: 'blue', }, center(-1, 0, 1)),
  new Cube({ front: 'yellow', }, center(0, 0, 1)),
  new Cube({ front: 'yellow', right: 'purple', }, center(1, 0, 1)),

  new Cube({ front: 'yellow', up: 'white', left: 'blue', }, center(-1, 1, 1)),
  new Cube({ front: 'yellow', up: 'white', }, center(0, 1, 1)),
  new Cube({ front: 'yellow', up: 'white', right: 'purple', }, center(1, 1, 1)),
]
