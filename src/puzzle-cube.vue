<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { CubeRenderer, PuzzleCude, RotationDirection, SliceName } from './puzzle-cube'
import { PuzzleCubeResolver } from './puzzle-cube/puzzle-cube-resolver'

const props = defineProps<{
	canvasWidth: number
	canvasHeight: number
}>()

const canvasEle = ref<HTMLCanvasElement>()
let puzzleCube: PuzzleCude
let puzzleCubeSolver: PuzzleCubeResolver

const onkeydown = (e: KeyboardEvent) => {
	console.log('e.key=', e.key)
	const key = e.key
	const isCapsLock = key.toUpperCase() === key || e.shiftKey
	const direction: RotationDirection = isCapsLock ? 'counterclockwise' : 'clockwise'
	switch (key.toLowerCase()) {
		case 'f':
			puzzleCube.rotateSlice('front', direction)
			break
		case 'q':
			puzzleCube.rotateSlice('vleft', direction)
			break
		case 'b':
			puzzleCube.rotateSlice('back', direction)
			break
		case 'u':
			puzzleCube.rotateSlice('up', direction)
			break
		case 'w':
			puzzleCube.rotateSlice('hfront', direction)
			break
		case 'd':
			puzzleCube.rotateSlice('down', direction)
			break
		case 'r':
			puzzleCube.rotateSlice('right', direction)
			break
		case 'e':
			puzzleCube.rotateSlice('vfront', direction)
			break
		case 'l':
			puzzleCube.rotateSlice('left', direction)
			break
		case 'enter':
			isCapsLock ? puzzleCubeSolver.scramble() : puzzleCubeSolver.solve()
			break
	}
	puzzleCube.render()
}

onMounted(() => {
	const cubeRenderer = new CubeRenderer(canvasEle.value!)
	puzzleCube = new PuzzleCude(cubeRenderer)
	puzzleCubeSolver = new PuzzleCubeResolver(puzzleCube)
	puzzleCube.render()
	window.addEventListener('keydown', onkeydown)
})
onUnmounted(() => {
	window.removeEventListener('keydown', onkeydown)
})
</script>

<template>
	<div class="canvas-wrapper">
		<canvas ref="canvasEle" :width="canvasWidth" :height="canvasHeight" @keydown="onkeydown" />
	</div>
</template>

<style scoped>
.canvas-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
