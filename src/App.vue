<script setup lang="ts">
import PuzzleCubeControlPane from './puzzle-cube-control-pane.vue'
import PuzzleCube from './puzzle-cube.vue'
</script>

<template>
	<main class="app">
		<PuzzleCubeControlPane class="control-pane" />
		<PuzzleCube class="cube-canvas" :canvas-width="400" :canvas-height="400" />
	</main>
</template>

<style scoped>
.app {
	width: 100vw;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: space-between;
}
.control-pane {
	flex: 0 0 200px;
}
.cube-canvas {
	flex: 1 0 auto;
}
</style>
