import { mat4, vec3 } from 'gl-matrix'
export interface GL extends WebGL2RenderingContext {
	program: WebGLProgram
}

export function getGl(canvasElement: HTMLCanvasElement) {
	const gl = canvasElement.getContext('webgl2')
	if (gl === null) {
		throw new Error('unable to get contenxt of webgl2')
	}
	return gl as GL
}

export function initShader(gl: GL, vshader: string, fshader: string) {
	const program = createProgram(gl, vshader, fshader)
	gl.useProgram(program)
	gl.program = program
	return program
}

export function createProgram(gl: GL, vshader: string, fshader: string) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader)
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader)

	const program = gl.createProgram()
	if (!program) {
		throw new Error('unable to create program')
	}

	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)

	const linked = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (!linked) {
		const error = gl.getProgramInfoLog(program)
		gl.deleteProgram(program)
		gl.deleteShader(fragmentShader)
		gl.deleteShader(vertexShader)
		throw new Error('Failed to link program: ' + error)
	}
	return program
}

export function loadShader(gl: GL, type: number, source: string) {
	const shader = gl.createShader(type)
	if (shader === null) {
		throw new Error('unable to create shader')
	}

	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
	if (!compiled) {
		const error = gl.getShaderInfoLog(shader)
		gl.deleteShader(shader)
		throw new Error('Failed to compile shader: \n' + error)
	}

	return shader
}

export function initVertexBuffers(
	gl: GL,
	vertices: Float32Array,
	totalSize: number,
	vertexAttributes: { attributeName: string; size: number; offset: number }[],
) {
	const vertexBuffer = gl.createBuffer()
	if (vertexBuffer === null) {
		throw new Error('unable to create buffer')
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

	const FSIZE = vertices.BYTES_PER_ELEMENT
	vertexAttributes.forEach(({ attributeName, offset, size }) => {
		const vertexAttribute = gl.getAttribLocation(gl.program, attributeName)
		gl.vertexAttribPointer(
			vertexAttribute,
			size,
			gl.FLOAT,
			false,
			FSIZE * totalSize,
			FSIZE * offset,
		)
		gl.enableVertexAttribArray(vertexAttribute)
	})

	return Math.floor(vertices.length / totalSize)
}

export function initIndicesBuffer(gl: GL, indices: Uint8Array) {
	const indicesBuffer = gl.createBuffer()
	if (indicesBuffer === null) {
		throw new Error('unable to create buffer')
	}
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
	return indices.length
}

export async function initTexture(gl: GL, samplerName: string, imageUrl: string) {
	return new Promise<void>((resolve, reject) => {
		const texture = gl.createTexture()
		if (texture === null) {
			throw new Error('unable to create texture')
		}
		const image = new Image()
		image.onload = () => {
			loadTexture(gl, texture, samplerName, image)
			resolve()
		}
		image.onerror = reject
		image.src = imageUrl
	})
}

export function loadTexture(
	gl: GL,
	texture: WebGLTexture,
	samplerName: string,
	image: HTMLImageElement,
) {
	const u_Sampler = gl.getUniformLocation(gl.program, samplerName)
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
	gl.uniform1i(u_Sampler, 0)
}

export function setMatrix(gl: GL, matrixName: string, matrix: mat4) {
	const u_Matrix = gl.getUniformLocation(gl.program, matrixName)
	gl.uniformMatrix4fv(u_Matrix, false, matrix)
}

interface SetLightParam {
	uniformName: string, vector: vec3, normalize?: boolean
}
export function setLight(gl: GL, params: SetLightParam[]) {
	params.forEach(({ uniformName, vector, normalize }) => {
		const location = gl.getUniformLocation(gl.program, uniformName)
		normalize && vec3.normalize(vector, vector)
		gl.uniform3fv(location, vector)
	})

}
