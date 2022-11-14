import { vec3, vec4 } from 'gl-matrix'
import { Transform } from './transform'

export type FaceName = 'front' | 'back' | 'up' | 'down' | 'left' | 'right'

export type FaceColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'white' | 'black'

export const Color: Record<FaceColor, vec4> = {
  red: vec4.fromValues(1, 0, 0, 1),
  green: vec4.fromValues(0, 1, 0, 1),
  blue: vec4.fromValues(0, 0, 1, 1),
  yellow: vec4.fromValues(1, 1, 0, 1),
  white: vec4.fromValues(1, 1, 1, 1),
  purple: vec4.fromValues(1, 0, 1, 1),
  black: vec4.fromValues(0.1, 0.1, 0.1, 1),
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
