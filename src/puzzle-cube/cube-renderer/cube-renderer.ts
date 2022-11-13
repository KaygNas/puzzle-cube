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

export class CubeRenderer {
  private gl: GL
  private VERTEX_SIZE = 4
  private COLOR_SIZE = 4
  private VERTICES_COUNT_PER_FACE = 4
  private FACE_COUNT = 6

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
    this.toVerticesBuffer(cube)
    const n = this.toIndicesBuffer()
    const _modelMat = mat4.multiply(mat4.create(), modelMat, cube.transform.localToWorld())
    setMatrix(gl, 'u_ModelMatrix', _modelMat)

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
  }

  private toVerticesBuffer(cube: Cube) {
    const { gl, VERTEX_SIZE, COLOR_SIZE, VERTICES_COUNT_PER_FACE, FACE_COUNT } = this

    const vertices = new Float32Array(
      (VERTEX_SIZE + COLOR_SIZE) * VERTICES_COUNT_PER_FACE * FACE_COUNT,
    )

    const cubeFront = cube.front
    const cubeUp = cube.up
    const cubeLeft = vec3.cross(vec3.create(), cubeFront, cubeUp)
    const cubeBack = vec3.scale(vec3.create(), cubeFront, -1)
    const cubeDown = vec3.scale(vec3.create(), cubeUp, -1)
    const cubeRight = vec3.scale(vec3.create(), cubeLeft, -1)

    let index = 0

    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.front,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeFront,
      toTop: cubeUp,
      toLeft: cubeLeft,
    })
    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.back,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeBack,
      toTop: cubeUp,
      toLeft: cubeLeft,
    })
    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.up,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeUp,
      toTop: cubeBack,
      toLeft: cubeLeft,
    })
    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.down,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeDown,
      toTop: cubeBack,
      toLeft: cubeLeft,
    })
    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.left,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeLeft,
      toTop: cubeUp,
      toLeft: cubeFront,
    })
    index = this.writeVertices(vertices, index, {
      color: cube.faceColors.right,
      cubeCenter: cube.center,
      cubeSize: cube.size,
      toCenter: cubeRight,
      toTop: cubeUp,
      toLeft: cubeFront,
    })
    initVertexBuffers(gl, vertices, VERTEX_SIZE + COLOR_SIZE, [
      { attributeName: 'a_Position', size: 4, offset: 0 },
      { attributeName: 'a_Color', size: 4, offset: 4 },
    ])
  }

  private toIndicesBuffer() {
    const { gl, FACE_COUNT } = this
    const INDICES_COUNT = 3 * 2 * FACE_COUNT
    const indices = new Uint8Array(INDICES_COUNT)
    let j = 0
    for (let i = 0; i < FACE_COUNT; i++) {
      indices[j++] = i * 4
      indices[j++] = i * 4 + 1
      indices[j++] = i * 4 + 2
      indices[j++] = i * 4
      indices[j++] = i * 4 + 2
      indices[j++] = i * 4 + 3
    }
    initIndicesBuffer(gl, indices)
    return indices.length
  }

  private writeVertices(
    vertices: Float32Array,
    startIndex: number,
    face: {
      cubeCenter: vec3
      cubeSize: number
      toCenter: vec3
      toTop: vec3
      toLeft: vec3
      color: vec4
    },
  ) {
    const center = vec3.clone(face.cubeCenter)
    const leftTop = vec3.create()
    const rightTop = vec3.create()
    const rightBottom = vec3.create()
    const leftBottom = vec3.create()
    const halfSideLength = 0.5 * face.cubeSize

    vec3.scaleAndAdd(center, center, face.toCenter, halfSideLength)

    vec3.scaleAndAdd(leftTop, center, face.toLeft, halfSideLength)
    vec3.scaleAndAdd(leftTop, leftTop, face.toTop, halfSideLength)

    vec3.scaleAndAdd(rightTop, center, face.toLeft, -halfSideLength)
    vec3.scaleAndAdd(rightTop, rightTop, face.toTop, halfSideLength)

    vec3.scaleAndAdd(rightBottom, center, face.toLeft, -halfSideLength)
    vec3.scaleAndAdd(rightBottom, rightBottom, face.toTop, -halfSideLength)

    vec3.scaleAndAdd(leftBottom, center, face.toLeft, halfSideLength)
    vec3.scaleAndAdd(leftBottom, leftBottom, face.toTop, -halfSideLength)

    function writeVertexIntoArray(
      vertices: Float32Array,
      startIndex: number,
      vertex: vec3,
      color: vec4,
    ) {
      let index = startIndex
      vertex.forEach((value) => {
        vertices[index++] = value
      })
      vertices[index++] = 1

      color.forEach((value) => {
        vertices[index++] = value
      })

      return index
    }

    let index = startIndex
    index = writeVertexIntoArray(vertices, index, leftTop, face.color)
    index = writeVertexIntoArray(vertices, index, rightTop, face.color)
    index = writeVertexIntoArray(vertices, index, rightBottom, face.color)
    index = writeVertexIntoArray(vertices, index, leftBottom, face.color)

    return index
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
