import { vec3, vec4 } from 'gl-matrix'
import { Transform } from './transform'

export type FaceName = 'front' | 'back' | 'up' | 'down' | 'left' | 'right'

export type FaceColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'white' | 'black'

export const Color: Record<FaceColor, vec4> = {
  red: vec4.fromValues(192 / 255, 72 / 255, 81 / 255, 1),
  green: vec4.fromValues(69 / 255, 183 / 255, 135 / 255, 1),
  blue: vec4.fromValues(26 / 255, 148 / 255, 188 / 255, 1),
  yellow: vec4.fromValues(228 / 255, 191 / 255, 17 / 255, 1),
  white: vec4.fromValues(251 / 255, 236 / 255, 222 / 255, 1),
  purple: vec4.fromValues(129 / 255, 60 / 255, 133 / 255, 1),
  black: vec4.fromValues(79 / 255, 64 / 255, 50 / 255, 1),
}


const defaultFaceColors = (): Record<FaceName, FaceColor> => {
  return {
    back: 'black',
    down: 'black',
    left: 'black',
    front: 'black',
    up: 'black',
    right: 'black',
  }
}

export class Cube {
  private _faceColors = defaultFaceColors()
  get faceColors(): Record<FaceName, vec4> {
    return {
      back: Color[this._faceColors.back],
      down: Color[this._faceColors.down],
      left: Color[this._faceColors.left],
      front: Color[this._faceColors.front],
      up: Color[this._faceColors.up],
      right: Color[this._faceColors.right]
    }
  }

  public front: vec3 = vec3.fromValues(0, 0, 1)
  public up: vec3 = vec3.fromValues(0, 1, 0)
  public size: number = 0.9
  public transform: Transform = new Transform()

  constructor(
    faceColors: Partial<Record<FaceName, FaceColor>>,
    public center: vec3,
  ) {
    Object.assign(this._faceColors, faceColors)
  }
}
