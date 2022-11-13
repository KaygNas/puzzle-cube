<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Cube, Transform, CubeRenderer } from './puzzle-cube'
import { vec3, vec4 } from 'gl-matrix'

const canvasEle = ref<HTMLCanvasElement>()

function main() {
	const red = vec4.fromValues(1, 0, 0, 1)
	const green = vec4.fromValues(0, 1, 0, 1)
	const blue = vec4.fromValues(0, 0, 1, 1)
	const black = vec4.fromValues(0, 0, 0, 1)

	const cube = new Cube(
		vec3.create(),
		vec3.fromValues(0, 0, 1),
		vec3.fromValues(0, 1, 0),
		{
			front: red,
			back: black,
			up: green,
			down: black,
			left: blue,
			right: black,
		},
		2,
		new Transform(),
	)
	const cubeRenderer = new CubeRenderer(canvasEle.value!)

	vec3.add(cube.transform.translate, cube.transform.translate, vec3.fromValues(2, 0, 0))
	cubeRenderer.render(cube)

	vec3.add(cube.transform.translate, cube.transform.translate, vec3.fromValues(-4, 0, 0))
	cubeRenderer.render(cube)
}

onMounted(() => {
	main()
})
</script>

<template>
	<canvas ref="canvasEle" width="800" height="800" />
</template>

<style scoped></style>
