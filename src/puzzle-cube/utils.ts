import { vec3 } from "gl-matrix"

/** helper for dealing with percision problem */
export function equal(a: number, b: number, percision: number = 0.001) {
  return Math.abs(a - b) < percision
}
export function equals(a: vec3, b: vec3) {
  return a.every((_, i) => equal(a[i], b[i]))
}