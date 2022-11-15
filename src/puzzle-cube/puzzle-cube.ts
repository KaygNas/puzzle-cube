import { mat4, quat, vec3 } from "gl-matrix";
import { assert } from "./assert";
import { Cube, FaceName } from "./cube";
import { CubeRenderer } from "./cube-renderer";
import { cubes as defaultCubes } from './cubes'
import { clamp } from 'lodash/fp'

export type SliceName = FaceName | 'hfront' | 'vfront' | 'vleft'
export interface Slice {
  cubes: Cube[]
  centerCube: Cube
  rotationAxis: vec3
}
export type RotationDirection = 'clockwise' | 'counterclockwise'

const center = vec3.fromValues
const axis = vec3.fromValues

const SLICE: Record<SliceName, { center: vec3, rotationAxis: vec3 }> = {
  front: { center: center(0, 0, 1), rotationAxis: axis(0, 0, 1) },
  vleft: { center: center(0, 0, 0), rotationAxis: axis(0, 0, 1) },
  back: { center: center(0, 0, -1), rotationAxis: axis(0, 0, 1) },
  up: { center: center(0, 1, 0), rotationAxis: axis(0, 1, 0) },
  hfront: { center: center(0, 0, 0), rotationAxis: axis(0, 1, 0) },
  down: { center: center(0, -1, 0), rotationAxis: axis(0, 1, 0) },
  left: { center: center(-1, 0, 0), rotationAxis: axis(1, 0, 0) },
  vfront: { center: center(0, 0, 0), rotationAxis: axis(1, 0, 0) },
  right: { center: center(1, 0, 0), rotationAxis: axis(1, 0, 0) },
}

export class PuzzleCude {
  private cubes: Cube[] = defaultCubes
  private rotating = false

  constructor(
    private cubeRenderer: CubeRenderer,
  ) {
    assert(this.cubes.length === 27, 'puzzle cube should have 27 cubes')

    this.cubes.forEach(cube => cubeRenderer.add(cube))
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

  private getSlice(name: SliceName): Slice {
    // given a slice name 
    // the rotation axis can be known

    // apply the transform of each cube
    // check wether it is on the slice

    // a record of slice can be prepared
    // the record tells the centers and rotation axis of each slice
    const { rotationAxis, center } = SLICE[name]
    const centerCube = this.cubes.find(cube => {
      const _center = vec3.create()
      vec3.transformMat4(_center, cube.center, cube.transform.localToWorld())
      return vec3.equals(_center, center)
    })
    assert(centerCube !== undefined, `centerCube should be find at ${center}`)

    let cubes: Cube[] = this.cubes
    const slice = (cubes: Cube[], axis: Partial<Record<'x' | 'y' | 'z', number>>) => {
      const isUndefinedOrEqual = (a: number | undefined, b: number) => {
        // fix percision when comparing
        return a === undefined || Math.abs(a - b) < 0.001
      }

      return cubes.filter(cube => {
        const center = vec3.create()
        vec3.transformMat4(center, cube.center, cube.transform.localToWorld())

        const isOnAxis = isUndefinedOrEqual(axis.x, center[0])
          && isUndefinedOrEqual(axis.y, center[1])
          && isUndefinedOrEqual(axis.z, center[2])
        return isOnAxis
      })
    }
    switch (name) {
      case 'front':
        cubes = slice(cubes, { z: center[2] })
        break;
      case 'back':
        cubes = slice(cubes, { z: center[2] })
        break;
      case 'up':
        cubes = slice(cubes, { y: center[1] })
        break;
      case 'down':
        cubes = slice(cubes, { y: center[1] })
        break;
      case 'left':
        cubes = slice(cubes, { x: center[0] })
        break;
      case 'right':
        cubes = slice(cubes, { x: center[0] })
        break;
      case 'vfront':
        cubes = slice(cubes, { x: center[0] })
        break;
      case 'hfront':
        cubes = slice(cubes, { y: center[1] })
        break;
      case 'vleft':
        cubes = slice(cubes, { z: center[2] })
        break;
      default:
        throw new Error('unvalid slice name!')
    }
    return {
      cubes,
      centerCube,
      rotationAxis
    }
  }
}