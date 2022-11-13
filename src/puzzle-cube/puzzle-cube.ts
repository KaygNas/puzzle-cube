import { assert } from "./assert";
import { Cube, FaceName } from "./cube";
import { CubeRenderer } from "./cube-renderer";
import { cubes as defaultCubes } from './cubes'
export type SliceName = FaceName | 'hfront' | 'vfront' | 'vleft'
export type CubeIndex = number
export interface Slice {
  cubeIndices: CubeIndex[]
  centerCubeIndex: CubeIndex
}
export type RotationDirection = 'clockwise' | 'counterclockwise'

export class PuzzleCude {
  constructor(
    private cubeRenderer: CubeRenderer,
    private cubes: Cube[] = defaultCubes,
  ) {
    assert(this.cubes.length === 27, 'puzzle cube should have 27 cubes')

    this.cubes.forEach(cube => cubeRenderer.add(cube))
  }

  rotateSlice(sliceName: SliceName, direction: RotationDirection) {
    // TOOD
  }

  render() {
    this.cubeRenderer.render()
  }
}