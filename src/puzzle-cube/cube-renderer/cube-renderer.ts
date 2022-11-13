import { Cube } from '../cube'
import { getGl, GL, initIndicesBuffer, initShader, initVertexBuffers } from './webgl-utils'
import VERTEX_SHADER from './vertex-shader.glsl'
import FRAGMENT_SHADER from './fragment-shader.glsl'
import { vec3, vec4 } from 'gl-matrix'

export class CubeRenderer {
	gl: GL
	VERTEX_SIZE = 4
	COLOR_SIZE = 4
	VERTICES_COUNT_PER_FACE = 4
	FACE_COUNT = 6

	constructor(private canvasElement: HTMLCanvasElement) {
		const gl = getGl(this.canvasElement)
		initShader(gl, VERTEX_SHADER, FRAGMENT_SHADER)
		this.gl = gl
	}

	render(cube: Cube): void {
		const { gl } = this
		this.toVerticesBuffer(cube)
		const n = this.toIndicesBuffer()
		gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0)
	}

	toVerticesBuffer(cube: Cube) {
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
		initVertexBuffers(gl, vertices, 8, [
			{ attributeName: 'a_Position', size: 4, offset: 0 },
			{ attributeName: 'a_Color', size: 4, offset: 4 },
		])
	}

	toIndicesBuffer() {
		const { gl, VERTEX_SIZE, COLOR_SIZE, VERTICES_COUNT_PER_FACE, FACE_COUNT } = this
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

	writeVertices(
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
		const center = vec3.create()
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
}
