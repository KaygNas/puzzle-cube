<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Cube, Transform, CubeRenderer } from './puzzle-cube'
import { vec3, vec4 } from 'gl-matrix'

const canvasEle = ref<HTMLCanvasElement>()

function main() {
	const cube = new Cube(
		vec3.create(),
		vec3.create(),
		vec3.create(),
		{
			front: vec4.create(),
			back: vec4.create(),
			up: vec4.create(),
			down: vec4.create(),
			left: vec4.create(),
			right: vec4.create(),
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
