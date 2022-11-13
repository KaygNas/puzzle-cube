import { mat4, quat, vec3 } from "gl-matrix";

export class Transform {
  translate = vec3.create()
  rotate = quat.create()
  scale = vec3.create()

  constructor() { }

  localToWorld() {
    const matrix = mat4.create()
    mat4.multiply(
      matrix,
      matrix,
      mat4.fromTranslation(mat4.create(), this.translate)
    )
    mat4.multiply(
      matrix,
      matrix,
      mat4.fromQuat(mat4.create(), this.rotate)
    )
    mat4.multiply(
      matrix,
      matrix,
      mat4.fromScaling(mat4.create(), this.scale)
    )
    return matrix
  }
}