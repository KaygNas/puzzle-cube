import { Cube } from '../cube'
import VERTEX_SHADER from './vertex-shader.glsl'
import FRAGMENT_SHADER from './fragment-shader.glsl'
import { vec3, mat4 } from 'gl-matrix'
import { CubeVerticesWriter } from './cube-vertices-writer'
import { Beam, ResourceTypes, SchemaTypes, Shader } from 'beam-gl'
export class CubeRenderer {
	private beam: Beam
	private shader: Shader

	private viewMat = mat4.create()
	private eye = vec3.fromValues(-3, 3, 7)
	private center = vec3.fromValues(0.0, 0.0, 0.0)
	private up = vec3.fromValues(0.0, 1.0, 0.0)
	private modelMat = mat4.create()
	private projMat = mat4.ortho(mat4.create(), -5, 5, -5, 5, 1, 100)

	cubes = new Set<Cube>()

	constructor(private canvasElement: HTMLCanvasElement) {
		this.beam = new Beam(canvasElement)
		this.shader = this.beam.shader({
			fs: FRAGMENT_SHADER,
			vs: VERTEX_SHADER,
			buffers: {
				a_Position: { type: SchemaTypes.vec4 },
				a_Color: { type: SchemaTypes.vec4 },
				a_Normal: { type: SchemaTypes.vec4 },
			},
			uniforms: {
				u_LightColor: { type: SchemaTypes.vec3, default: vec3.fromValues(1, 1, 1) },
				u_AmbientLight: { type: SchemaTypes.vec3, default: vec3.fromValues(0.6, 0.6, 0.6) },
				u_LightPosition: { type: SchemaTypes.vec3, default: vec3.fromValues(-3.0, 7.0, 8.0) },
				u_ViewMatrix: { type: SchemaTypes.mat4, default: this.viewMat },
				u_ProjMatrix: { type: SchemaTypes.mat4, default: this.projMat },
				u_ModelMatrix: { type: SchemaTypes.mat4, default: this.modelMat },
			},
		})
		const gl = this.beam.gl
		gl.enable(gl.DEPTH_TEST)
		this.enableRotationControl()
	}

	add(cube: Cube) {
		this.cubes.add(cube)
	}

	render() {
		const { viewMat, eye, center, up } = this
		mat4.lookAt(viewMat, eye, center, up)
		this.cubes.forEach((cube) => this.renderCube(cube))
	}

	private renderCube(cube: Cube): void {
		const { modelMat, beam, shader, viewMat, projMat } = this
		const { vertices, indices } = CubeVerticesWriter.toVertices(cube)
		const _modelMat = mat4.multiply(mat4.create(), modelMat, cube.transform.localToWorld())
		beam.draw(
			shader,
			beam.resource(ResourceTypes.VertexBuffers, {
				a_Position: vertices.position,
				a_Color: vertices.color,
				a_Normal: vertices.normal,
			}),
			beam.resource(ResourceTypes.IndexBuffer, { array: indices }),
			beam.resource(ResourceTypes.Uniforms, {
				u_ModelMatrix: _modelMat,
				u_ViewMatrix: viewMat,
				u_ProjMatrix: projMat,
			}),
		)
	}

	private enableRotationControl() {
		const onkeydown = (e: KeyboardEvent) => {
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
		window.addEventListener('keydown', onkeydown)
	}
}
