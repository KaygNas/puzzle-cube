import { vec3, vec4 } from 'gl-matrix'
import { Cube } from '../cube'

const VERTICES_COUNT_PER_FACE = 4
const FACE_COUNT = 6

const indices = createIndices()

function createIndices() {
	const INDICES_COUNT = 3 * 2 * FACE_COUNT
	const indices = new Uint16Array(INDICES_COUNT)
	let j = 0
	for (let i = 0; i < FACE_COUNT; i++) {
		indices[j++] = i * 4
		indices[j++] = i * 4 + 1
		indices[j++] = i * 4 + 2
		indices[j++] = i * 4
		indices[j++] = i * 4 + 2
		indices[j++] = i * 4 + 3
	}
	return indices
}

function createEmptyArray() {
	return new Float32Array(VERTICES_COUNT_PER_FACE * FACE_COUNT * 4)
}

export class CubeVerticesWriter {
	indices = indices
	vertices = {
		position: createEmptyArray(),
		color: createEmptyArray(),
		normal: createEmptyArray(),
	}
	private currIndex = {
		position: 0,
		color: 0,
		normal: 0,
	}

	static toVertices(cube: Cube) {
		const writer = new CubeVerticesWriter()
		writer.writeVertices(cube)
		return writer
	}

	private writeVertices(cube: Cube) {
		const { vertices } = this
		const cubeFront = cube.front
		const cubeUp = cube.up
		const cubeLeft = vec3.cross(vec3.create(), cubeFront, cubeUp)
		const cubeBack = vec3.scale(vec3.create(), cubeFront, -1)
		const cubeDown = vec3.scale(vec3.create(), cubeUp, -1)
		const cubeRight = vec3.scale(vec3.create(), cubeLeft, -1)

		this.writeFaceVertices({
			color: cube.faceColors.front,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeFront,
			toTop: cubeUp,
			toLeft: cubeLeft,
		})
		this.writeFaceVertices({
			color: cube.faceColors.back,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeBack,
			toTop: cubeUp,
			toLeft: cubeLeft,
		})
		this.writeFaceVertices({
			color: cube.faceColors.up,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeUp,
			toTop: cubeBack,
			toLeft: cubeLeft,
		})
		this.writeFaceVertices({
			color: cube.faceColors.down,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeDown,
			toTop: cubeBack,
			toLeft: cubeLeft,
		})
		this.writeFaceVertices({
			color: cube.faceColors.left,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeLeft,
			toTop: cubeUp,
			toLeft: cubeFront,
		})
		this.writeFaceVertices({
			color: cube.faceColors.right,
			cubeCenter: cube.center,
			cubeSize: cube.size,
			toCenter: cubeRight,
			toTop: cubeUp,
			toLeft: cubeFront,
		})

		return vertices
	}

	private writeFaceVertices(face: {
		cubeCenter: vec3
		cubeSize: number
		toCenter: vec3
		toTop: vec3
		toLeft: vec3
		color: vec4
	}) {
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

		this.writeVertex(leftTop, face.color, face.toCenter)
		this.writeVertex(rightTop, face.color, face.toCenter)
		this.writeVertex(rightBottom, face.color, face.toCenter)
		this.writeVertex(leftBottom, face.color, face.toCenter)
	}

	private writeVertex(position: vec3, color: vec4, normal: vec3) {
		const { vertices, currIndex } = this
		let index = currIndex

		position.forEach((value) => {
			vertices.position[index.position++] = value
		})
		vertices.position[index.position++] = 1

		color.forEach((value) => {
			vertices.color[index.color++] = value
		})

		normal.forEach((value) => {
			vertices.normal[index.normal++] = value
		})
		vertices.normal[index.normal++] = 1

		this.currIndex = index
	}
}
