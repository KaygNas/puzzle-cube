<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { CubeRenderer, PuzzleCude, RotationDirection, SliceName } from './puzzle-cube'

const props = defineProps<{
	canvasWidth: number
	canvasHeight: number
}>()

const canvasEle = ref<HTMLCanvasElement>()
let puzzleCube: PuzzleCude

const onkeydown = (e: KeyboardEvent) => {
	console.log('e.key=', e.key)
	const direction: RotationDirection = e.shiftKey ? 'counterclockwise' : 'clockwise'
	switch (e.key.toLowerCase()) {
		case 'q':
			puzzleCube.rotateSlice('front', direction)
			break
		case 'w':
			puzzleCube.rotateSlice('vleft', direction)
			break
		case 'e':
			puzzleCube.rotateSlice('back', direction)
			break
		case 'a':
			puzzleCube.rotateSlice('up', direction)
			break
		case 's':
			puzzleCube.rotateSlice('hfront', direction)
			break
		case 'd':
			puzzleCube.rotateSlice('down', direction)
			break
		case 'z':
			puzzleCube.rotateSlice('left', direction)
			break
		case 'x':
			puzzleCube.rotateSlice('vfront', direction)
			break
		case 'c':
			puzzleCube.rotateSlice('right', direction)
			break
	}
	puzzleCube.render()
}

onMounted(() => {
	const cubeRenderer = new CubeRenderer(canvasEle.value!)
	puzzleCube = new PuzzleCude(cubeRenderer)
	puzzleCube.render()
	window.addEventListener('keydown', onkeydown)
})
onUnmounted(() => {
	window.removeEventListener('keydown', onkeydown)
})
</script>

<template>
	<canvas ref="canvasEle" :width="canvasWidth" :height="canvasHeight" @keydown="onkeydown" />
</template>

<style scoped></style>
