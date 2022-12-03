<script lang="ts" setup>
import { computed, ref } from 'vue'
import KeyboardButton from './keyboard-button.vue'
const LAYER_ROTATE_BUTTONS = [
	{ action: 'F', keyName: 'F' },
	{ action: 'MFB', keyName: 'Q' },
	{ action: 'B', keyName: 'B' },
	{ action: 'U', keyName: 'U' },
	{ action: 'MUD', keyName: 'W' },
	{ action: 'D', keyName: 'D' },
	{ action: 'R', keyName: 'R' },
	{ action: 'MRL', keyName: 'E' },
	{ action: 'L', keyName: 'L' },
]

const capsLock = ref(false)
const layerRotateButtons = computed(() => {
	return LAYER_ROTATE_BUTTONS.map((button) => ({
		...button,
		action: capsLock.value ? `${button.action}'` : button.action,
	}))
})
const enterAction = computed(() => (capsLock.value ? 'scramble' : 'solve'))
</script>

<template>
	<section class="puzzle-cube-control-pane">
		<h3>Layer Rotate</h3>
		<template v-for="(button, index) in layerRotateButtons" :key="index">
			<KeyboardButton v-bind="button" :caps-lock="capsLock" />
			<hr v-if="index % 3 === 2" />
		</template>
		<KeyboardButton :action="enterAction" key-name="Enter" :caps-lock="capsLock" />
		<hr />

		<KeyboardButton
			action="Reverse"
			key-name="Shift"
			:caps-lock="capsLock"
			@pressed="capsLock = !capsLock"
		/>
		<h3>Camera Rotate</h3>
		<KeyboardButton action="up" key-name="ArrowUp" button-name="↑" />
		<KeyboardButton action="down" key-name="ArrowDown" button-name="↓" />
		<KeyboardButton action="left" key-name="ArrowLeft" button-name="←" />
		<KeyboardButton action="right" key-name="ArrowRight" button-name="→" />
	</section>
</template>

<style scoped>
.puzzle-cube-control-pane {
	height: 100vh;
	overflow: auto;

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
