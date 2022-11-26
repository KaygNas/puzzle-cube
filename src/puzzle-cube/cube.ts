import { vec3, vec4 } from 'gl-matrix'
import { assert } from './assert'
import { Transform } from './transform'

export const FACE_NAMES = ['up', 'front', 'left', 'down', 'back', 'right'] as const
export type FaceName = typeof FACE_NAMES[number]

export type FaceColor = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'white'

export type CubeType = 'center' | 'edge' | 'corner'

export const COLOR: Record<FaceColor, vec4> = {
  red: vec4.fromValues(192 / 255, 72 / 255, 81 / 255, 1),
  green: vec4.fromValues(69 / 255, 183 / 255, 135 / 255, 1),
  blue: vec4.fromValues(26 / 255, 148 / 255, 188 / 255, 1),
  yellow: vec4.fromValues(228 / 255, 191 / 255, 17 / 255, 1),
  white: vec4.fromValues(251 / 255, 236 / 255, 222 / 255, 1),
  orange: vec4.fromValues(248 / 255, 107 / 255, 29 / 255, 1),
}
const BLACK_COLOR = vec4.fromValues(79 / 255, 64 / 255, 50 / 255, 1)
const mapColor = (colorName: FaceColor | undefined): vec4 => {
  if (!colorName) return BLACK_COLOR
  else return COLOR[colorName]
}

const COLOR_FACE_MAP: Record<Exclude<FaceColor, 'black'>, FaceName> = {
  white: 'up',
  red: 'front',
  green: 'left',
  orange: 'down',
  yellow: 'back',
  blue: 'right',
} as const
export const mapColorToFace = (color: FaceColor | undefined) => {
  assert(!!color, 'color must not be undefined')
  return COLOR_FACE_MAP[color]
}
const defaultFaceColors = (): Record<FaceName, FaceColor | undefined> => {
  return {
    up: 'white',
    front: 'red',
    left: 'green',
    down: 'orange',
    back: 'yellow',
    right: 'blue',
  }
}

export class Cube {
  faceColorNames = defaultFaceColors()
  get faceColors(): Record<FaceName, vec4> {
    return {
      back: mapColor(this.faceColorNames.back),
      down: mapColor(this.faceColorNames.down),
      left: mapColor(this.faceColorNames.left),
      front: mapColor(this.faceColorNames.front),
      up: mapColor(this.faceColorNames.up),
      right: mapColor(this.faceColorNames.right),
    }
  }

  get faceNormals() {
    const up = vec3.clone(this.up)
    const front = vec3.clone(this.front)
    const back = vec3.fromValues(0, 0, -1)
    const down = vec3.fromValues(0, -1, 0)
    const right = vec3.fromValues(1, 0, 0)
    const left = vec3.fromValues(-1, 0, 0)
    const localToWordMatrix = this.transform.localToWorld()
    function toWorld(normal: vec3) {
      return vec3.transformMat4(normal, normal, localToWordMatrix)
    }
    return {
      up: toWorld(up),
      front: toWorld(front),
      back: toWorld(back),
      down: toWorld(down),
      right: toWorld(right),
      left: toWorld(left),
    }
  }

  public front: vec3 = vec3.fromValues(0, 0, 1)
  public up: vec3 = vec3.fromValues(0, 1, 0)
  public size: number = 0.9
  public transform: Transform = new Transform()
  public type: CubeType

  constructor(public center: vec3, colorFaces: FaceName[]) {
    this.type = colorFaces.length === 3 ? 'corner' : colorFaces.length === 2 ? 'edge' : 'center'
    const uncolorFaces: FaceName[] = FACE_NAMES.filter((face) => !colorFaces.includes(face))
    uncolorFaces.forEach((face) => (this.faceColorNames[face] = undefined))
  }
}
