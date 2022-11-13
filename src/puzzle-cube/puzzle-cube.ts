import { Cube, FaceName } from "./cube";
import { CubeRenderer } from "./cube-renderer";

export type SliceName = FaceName | 'hfront' | 'vfront' | 'vleft'
export type CubeIndex = number
export interface Slice {
  cubeIndices: CubeIndex[]
  centerCubeIndex: CubeIndex
}
export type RotationDirection = 'clockwise' | 'counterclockwise'

export class PuzzleCude {
  constructor(
    private cubes: Cube[],
    private slices: Record<SliceName, Slice>,
    private cubeRenderer: CubeRenderer
  ) { }

  rotateSlice(sliceName: SliceName, direction: RotationDirection) {
    // TOOD
  }

  render() {
    this.cubes.forEach(cube => this.cubeRenderer.render(cube))
  }
}