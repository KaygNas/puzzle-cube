import { vec3, vec4 } from 'gl-matrix'
import { assert } from './assert'
import { PuzzleCude } from './puzzle-cube'
import { Transform } from './transform'

export type CubeType = 'center' | 'edge' | 'corner'
export type FaceColor = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'white'
export type FaceName = typeof FACE_NAMES[number]

export const COLOR: Record<FaceColor, vec4> = {
  red: vec4.fromValues(192 / 255, 72 / 255, 81 / 255, 1),
  green: vec4.fromValues(69 / 255, 183 / 255, 135 / 255, 1),
  blue: vec4.fromValues(26 / 255, 148 / 255, 188 / 255, 1),
  yellow: vec4.fromValues(228 / 255, 191 / 255, 17 / 255, 1),
  white: vec4.fromValues(251 / 255, 236 / 255, 222 / 255, 1),
  orange: vec4.fromValues(248 / 255, 107 / 255, 29 / 255, 1),
}
export const BLACK_COLOR = vec4.fromValues(79 / 255, 64 / 255, 50 / 255, 1)
export const FACE_NAMES = ['up', 'front', 'left', 'down', 'back', 'right'] as const
const COLOR_FACE_MAP: Record<Exclude<FaceColor, 'black'>, FaceName> = {
  white: 'up',
  red: 'front',
  green: 'left',
  orange: 'back',
  yellow: 'down',
  blue: 'right',
} as const

/** @deprecated */
export const mapColorToFace = (color: FaceColor | undefined) => {
  assert(!!color, 'color must not be undefined')
  return COLOR_FACE_MAP[color]
}

export class Cube {
  type: CubeType
  front: vec3 = vec3.fromValues(0, 0, 1)
  up: vec3 = vec3.fromValues(0, 1, 0)
  size: number = 0.9
  transform: Transform = new Transform()
  faceColorNames: Record<FaceName, FaceColor> = {
    up: 'white',
    front: 'red',
    left: 'green',
    down: 'yellow',
    back: 'orange',
    right: 'blue',
  }
  get colors() {
    return Object.values(this.faceColorNames)
  }
  get faceColors(): Record<FaceName, vec4> {
    return {
      back: this.toColorVec4(this.faceColorNames.back),
      down: this.toColorVec4(this.faceColorNames.down),
      left: this.toColorVec4(this.faceColorNames.left),
      front: this.toColorVec4(this.faceColorNames.front),
      up: this.toColorVec4(this.faceColorNames.up),
      right: this.toColorVec4(this.faceColorNames.right),
    }
  }
  get faceNormals() {
    return {
      up: this.getFaceNormal('up'),
      front: this.getFaceNormal('front'),
      back: this.getFaceNormal('back'),
      down: this.getFaceNormal('down'),
      right: this.getFaceNormal('right'),
      left: this.getFaceNormal('left'),
    }
  }

  constructor(public center: vec3, colorFaces: FaceName[], private parent: PuzzleCude) {
    this.type = colorFaces.length === 3 ? 'corner' : colorFaces.length === 2 ? 'edge' : 'center'
    const uncolorFaces: FaceName[] = FACE_NAMES.filter((face) => !colorFaces.includes(face))
    uncolorFaces.forEach((face) => (delete this.faceColorNames[face]))
  }
  toColorVec4(color: FaceColor) {
    if (!color) return BLACK_COLOR
    else return COLOR[color]
  }
  getFaceByColor(color: FaceColor) {
    const COLOR_FACE_MAP: Record<FaceColor, FaceName> = {
      white: 'up',
      red: 'front',
      green: 'left',
      orange: 'back',
      yellow: 'down',
      blue: 'right',
    }
    assert(!!color, 'color must not be undefined')
    const faceName = COLOR_FACE_MAP[color]
    const getFaceNormal = () => this.getFaceNormal(faceName)
    const getFacing = () => this.parent.getFaceByNormal(getFaceNormal()).name
    return {
      color,
      face: faceName,
      get faceNormal() {
        return getFaceNormal()
      },
      get facing() {
        return getFacing() as FaceName
      }
    }
  }
  getAdjacentFacesOfColor(color: FaceColor) {
    return this.colors
      .filter(_color => _color !== color)
      .map(color => this.getFaceByColor(color))
  }
  getColorByFace(face: FaceName) {
    return this.faceColorNames[face]
  }
  getFaceNormal(face: FaceName) {
    const localToWordMatrix = this.transform.localToWorld()
    function toWorld(normal: vec3) {
      return vec3.transformMat4(normal, normal, localToWordMatrix)
    }
    const normal = {
      up: () => toWorld(vec3.clone(this.up)),
      front: () => toWorld(vec3.clone(this.front)),
      back: () => toWorld(vec3.fromValues(0, 0, -1)),
      down: () => toWorld(vec3.fromValues(0, -1, 0)),
      right: () => toWorld(vec3.fromValues(1, 0, 0)),
      left: () => toWorld(vec3.fromValues(-1, 0, 0)),
    }
    return normal[face]()
  }
}
