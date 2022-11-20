<script setup lang="ts">
import PuzzleCubeControlPane from './puzzle-cube-control-pane.vue'
import PuzzleCube from './puzzle-cube.vue'
</script>

<template>
	<PuzzleCubeControlPane />
	<PuzzleCube :canvas-width="400" :canvas-height="400" />
</template>

<style scoped></style>
