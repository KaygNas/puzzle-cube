<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Cube, Transform, CubeRenderer } from './puzzle-cube'
import { vec3, vec4 } from 'gl-matrix'

const canvasEle = ref<HTMLCanvasElement>()

function main() {
	const color = vec4.fromValues(1, 0, 0, 1)
	const cube = new Cube(
		vec3.create(),
		vec3.fromValues(0, 0, 1),
		vec3.fromValues(0, 1, 0),
		{
			front: color,
			back: color,
			up: color,
			down: color,
			left: color,
			right: color,
		},
		2,
		new Transform(),
	)
	const cubeRenderer = new CubeRenderer(canvasEle.value!)

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
