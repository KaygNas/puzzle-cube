import { Cube } from "../cube";

export class CubeRenderer {
  gl: WebGLRenderingContext

  constructor(
    private canvasEle: HTMLCanvasElement
  ) {
    const gl = this.canvasEle.getContext('webgl2')
    if (gl === null) {
      throw new Error('unable to get webgl2 context!')
    }
    this.gl = gl
  }

  render(cube: Cube): void {
    const { gl } = this
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
}