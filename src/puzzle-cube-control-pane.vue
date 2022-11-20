<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import KeyboardButton from './keyboard-button.vue'
const LAYER_ROTATE_BUTTONS = [
	{ action: 'F', keyName: 'Q' },
	{ action: 'MFB', keyName: 'W' },
	{ action: 'B', keyName: 'E' },
	{ action: 'U', keyName: 'A' },
	{ action: 'MUD', keyName: 'S' },
	{ action: 'D', keyName: 'D' },
	{ action: 'L', keyName: 'Z' },
	{ action: 'MLR', keyName: 'X' },
	{ action: 'R', keyName: 'C' },
]

const shiftKey = ref(false)
const layerRotateButtons = computed(() => {
	return LAYER_ROTATE_BUTTONS.map(button => ({ ...button, action: shiftKey.value ? `${button.action}'` : button.action }))
})
</script>

<template>
	<section class="puzzle-cube-control-pane">
		<h3>Layer Rotate</h3>
		<template v-for="(button, index) in layerRotateButtons" :key="index">
			<KeyboardButton v-bind="button" :shift-key="shiftKey" />
			<hr v-if="index % 3 === 2" />
		</template>

		<KeyboardButton action="Reverse" key-name="Shift" @keydown="shiftKey = true" @keyup="shiftKey = false" />

		<h3>Camera Rotate</h3>
		<KeyboardButton action="up" key-name="ArrowUp" button-name="↑" />
		<KeyboardButton action="down" key-name="ArrowDown" button-name="↓" />
		<KeyboardButton action="left" key-name="ArrowLeft" button-name="←" />
		<KeyboardButton action="right" key-name="ArrowRight" button-name="→" />
	</section>
</template>

<style scoped>
.puzzle-cube-control-pane {
	position: fixed;
	left: 0;
	top: 24px;

	background-color: #00000033;
	padding: 24px;
	border-radius: 0 6px 6px 0;

	display: flex;
	flex-direction: column;
	gap: 6px;
}

hr {
	width: 100%;
}
</style>
