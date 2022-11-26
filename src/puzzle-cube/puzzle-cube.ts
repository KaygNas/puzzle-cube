import { mat3, mat4, quat, vec3 } from 'gl-matrix'
import { assert } from './assert'
import { Cube, FaceColor, FaceName, mapColorToFace } from './cube'
import { CubeRenderer } from './cube-renderer'
import { cubes as defaultCubes } from './cubes'
import { equal } from './utils'

export type SliceName = FaceName | 'hfront' | 'vfront' | 'vleft'
const SLICE_NAME_TO_SHORT: Record<SliceName, string> = {
  up: 'U',
  hfront: 'MUD',
  down: 'D',
  front: 'F',
  vleft: 'MFB',
  back: 'B',
  right: 'R',
  vfront: 'MRL',
  left: 'L',
}
export function mapSliceNameToShort(sliceName: SliceName) {
  return SLICE_NAME_TO_SHORT[sliceName]
}

const SLICE_NAME_SHORT: Record<string, SliceName> = {
  U: 'up',
  MUD: 'hfront',
  D: 'down',
  F: 'front',
  MFB: 'vleft',
  B: 'back',
  R: 'right',
  MRL: 'vfront',
  L: 'left',
}
export interface Slice {
  name: SliceName
  cubes: Cube[]
  centerCube: Cube
  rotationAxis: vec3
}
export type RotationDirection = 'clockwise' | 'counterclockwise'

const center = vec3.fromValues
const normal = vec3.fromValues

const NOMARILIZE_FACE_NORMAL: Record<FaceName, vec3> = {
  front: normal(0, 0, 1),
  back: normal(0, 0, -1),
  up: normal(0, 1, 0),
  down: normal(0, -1, 0),
  right: normal(1, 0, 0),
  left: normal(-1, 0, 0),
}
export const mapNomalizeFaceNormal = (faceName: FaceName) => NOMARILIZE_FACE_NORMAL[faceName]
export const mapNomalizeFaceColorNormal = (faceColor: FaceColor | undefined) => mapNomalizeFaceNormal(mapColorToFace(faceColor))

const SLICE: Record<SliceName, { center: vec3; rotationAxis: vec3 }> = {
  front: { center: center(0, 0, 1), rotationAxis: NOMARILIZE_FACE_NORMAL.front },
  vleft: { center: center(0, 0, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.front },
  back: { center: center(0, 0, -1), rotationAxis: NOMARILIZE_FACE_NORMAL.back },
  up: { center: center(0, 1, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.up },
  hfront: { center: center(0, 0, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.up },
  down: { center: center(0, -1, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.down },
  right: { center: center(1, 0, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.right },
  vfront: { center: center(0, 0, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.right },
  left: { center: center(-1, 0, 0), rotationAxis: NOMARILIZE_FACE_NORMAL.left },
}

export class PuzzleCude {
  private cubes: Cube[] = defaultCubes
  private rotating = false

  constructor(private cubeRenderer: CubeRenderer) {
    assert(this.cubes.length === 27, 'puzzle cube should have 27 cubes')

    this.cubes.forEach((cube) => cubeRenderer.add(cube))
  }

  async do(directives: string | string[]) {
    const strArr = typeof directives === 'string' ? directives.split(" ") : directives
    const _directives = strArr.filter(Boolean).map((str) => {
      assert(!!str, `directivesStr: "${directives}" should not have emtpy string.`)
      const direction: RotationDirection = str.endsWith(`'`) ? 'counterclockwise' : 'clockwise'
      const sliceNameShort = str.endsWith(`'`) ? str.slice(0, str.length - 1) : str
      const sliceName = SLICE_NAME_SHORT[sliceNameShort]
      assert(sliceName !== undefined, `${sliceNameShort} should have coresponding sliceName.`)
      return { direction, sliceName }
    })
    for (const { sliceName, direction } of _directives) {
      await this.rotateSlice(sliceName, direction)
    }
  }

  async rotateSlice(sliceName: SliceName, direction: RotationDirection) {
    if (this.rotating) {
      return
    }

    const slice = this.getSlice(sliceName)
    const rad = 0.5 * Math.PI * (direction === 'clockwise' ? -1 : 1)
    this.rotating = true
    await this.animate((dt) => {
      const drad = rad * dt
      slice.cubes.forEach((cube) => {
        cube.transform.rotate(slice.rotationAxis, drad)
      })
      this.render()
    }, 200).finally(() => {
      this.rotating = false
    })
  }

  async animate(callback: (dt: number) => void, time: number) {
    let start: number | undefined = undefined
    let last: number | undefined = undefined
    let st = 0 // sum of delta t

    return new Promise<void>((resolve) => {
      const animationCallback: FrameRequestCallback = (timestamp) => {
        if (start === undefined) {
          start = timestamp
        }
        if (last == undefined) {
          last = timestamp
        }

        let dt = (timestamp - last) / time
        st += dt
        dt = st < 1 ? dt : dt - (st - 1) // make sure the sum of dt not exceed 1
        last = timestamp

        callback(dt)

        if (st < 1) {
          requestAnimationFrame(animationCallback)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animationCallback)
    })
  }

  render() {
    this.cubeRenderer.render()
  }

  getSlice(name: SliceName): Slice {
    // given a slice name
    // the rotation axis can be known

    // apply the transform of each cube
    // check wether it is on the slice

    // a record of slice can be prepared
    // the record tells the centers and rotation axis of each slice
    const { rotationAxis, center } = SLICE[name]
    const centerCube = this.cubes.find((cube) => {
      const _center = vec3.create()
      vec3.transformMat4(_center, cube.center, cube.transform.localToWorld())
      return vec3.equals(_center, center)
    })
    assert(centerCube !== undefined, `centerCube should be find at ${center}`)
    const cubes = this.cubes.filter(cube => this.isCubeAtSlice(cube, name))
    return {
      name,
      cubes,
      centerCube,
      rotationAxis,
    }
  }

  isCubeAtSlice(cube: Cube, sliceName: SliceName) {
    const slice = SLICE[sliceName]
    const center = vec3.create()
    vec3.transformMat4(center, cube.center, cube.transform.localToWorld())
    const isOrth = equal(vec3.dot(slice.rotationAxis, vec3.subtract(vec3.create(), slice.center, center)), 0)
    return isOrth
  }
}
