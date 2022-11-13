import { vec3, vec4 } from "gl-matrix";
import { Transform } from "./transform";
export type FaceName = 'front' | 'back' | 'up' | 'down' | 'left' | 'right'

export class Cube {
  constructor(
    public center: vec3,
    public front: vec3,
    public up: vec3,
    public faceColors: Record<FaceName, vec4>,
    public size: number,
    public transform: Transform
  ) { }
}