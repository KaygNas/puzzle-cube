<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CubeRenderer, PuzzleCude } from './puzzle-cube'

const canvasEle = ref<HTMLCanvasElement>()

function main() {
	const cubeRenderer = new CubeRenderer(canvasEle.value!)
	const puzzleCube = new PuzzleCude(cubeRenderer)
	puzzleCube.render()
}

onMounted(() => {
	main()
})
</script>

<template>
	<canvas ref="canvasEle" width="800" height="800" />
</template>

<style scoped></style>
