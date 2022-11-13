import { Cube } from '../cube'
import {
  getGl,
  GL,
  initIndicesBuffer,
  initShader,
  initVertexBuffers,
  setLight,
  setMatrix,
} from './webgl-utils'
import VERTEX_SHADER from './vertex-shader.glsl'
import FRAGMENT_SHADER from './fragment-shader.glsl'
import { vec3, vec4, mat4 } from 'gl-matrix'
import { CubeVerticesWriter } from './cube-vertices-writer'

export class CubeRenderer {
  private gl: GL

  private viewMat = mat4.create()
  private eye = vec3.fromValues(-3, 3, 7)
  private center = vec3.fromValues(0.0, 0.0, 0.0)
  private up = vec3.fromValues(0.0, 1.0, 0.0)
  private modelMat = mat4.create()
  private projMat = mat4.ortho(mat4.create(), -5, 5, -5, 5, 1, 100)

  cubes = new Set<Cube>()

  constructor(private canvasElement: HTMLCanvasElement) {
    const gl = getGl(this.canvasElement)
    initShader(gl, VERTEX_SHADER, FRAGMENT_SHADER)
    gl.enable(gl.DEPTH_TEST)
    this.enableRotationControl()
    this.gl = gl
  }

  add(cube: Cube) {
    this.cubes.add(cube)
  }

  render() {
    const { gl, viewMat, eye, center, up, projMat } = this
    mat4.lookAt(viewMat, eye, center, up)
    setMatrix(gl, 'u_ViewMatrix', viewMat)
    setMatrix(gl, 'u_ProjMatrix', projMat)

    this.cubes.forEach(cube => this.renderCube(cube))
  }

  private renderCube(cube: Cube): void {
    const { gl, modelMat } = this
    const { vertices, indices, VERTEX_TOTAL_SIZE } = CubeVerticesWriter.toVertices(cube)
    initVertexBuffers(gl, vertices, VERTEX_TOTAL_SIZE, [
      { attributeName: 'a_Position', size: 4, offset: 0 },
      { attributeName: 'a_Color', size: 4, offset: 4 },
    ])
    initIndicesBuffer(gl, indices)

    const _modelMat = mat4.multiply(mat4.create(), modelMat, cube.transform.localToWorld())
    setMatrix(gl, 'u_ModelMatrix', _modelMat)

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0)
  }

  private enableRotationControl() {
    document.onkeydown = (e) => {
      const { modelMat } = this
      const tranformMat = mat4.create()
      switch (e.key) {
        case 'ArrowLeft':
          mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(0.0, 1.0, 0.0))
          break
        case 'ArrowRight':
          mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(0.0, 1.0, 0.0))
          break
        case 'ArrowUp':
          mat4.fromRotation(tranformMat, 0.1, vec3.fromValues(1.0, 0.0, 0.0))
          break
        case 'ArrowDown':
          mat4.fromRotation(tranformMat, -0.1, vec3.fromValues(1.0, 0.0, 0.0))
          break
        default:
      }
      mat4.multiply(modelMat, modelMat, tranformMat)
      this.render()
    }
  }
}
