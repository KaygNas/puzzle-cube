<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvasEle = ref<HTMLCanvasElement>()

onMounted(() => {
	const context = canvasEle.value?.getContext('webgl2')!
	context.clearColor(0, 0, 0, 1)
	context.clear(context.COLOR_BUFFER_BIT)
})
</script>

<template>
	<canvas ref="canvasEle" width="800" height="800" />
</template>

<style scoped></style>
