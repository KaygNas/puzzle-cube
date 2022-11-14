import { mat4, quat, vec3 } from 'gl-matrix'

export class Transform {
  private _matrix = mat4.create()

  constructor() { }

  rotate(axis: vec3, rad: number,) {
    const _axis = vec3.clone(axis)
    vec3.transformMat4(_axis, _axis, this.wordTolocal())

    mat4.rotate(this._matrix, this._matrix, rad, _axis)
  }

  localToWorld() {
    return this._matrix
  }

  wordTolocal() {
    const _matrix = mat4.clone(this._matrix)
    mat4.invert(_matrix, this._matrix)
    return _matrix
  }
}
