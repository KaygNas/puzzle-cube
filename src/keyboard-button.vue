<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
	action: string
	keyName: string
	buttonName?: string
	shiftKey?: boolean
}>()
const emit = defineEmits<{
	(e: 'keydown', key: string): void
	(e: 'keyup', key: string): void
}>()

const buttonState = reactive({ keyDown: false })

function triggerKeyDown() {
	window.dispatchEvent(new KeyboardEvent('keydown', { key: props.keyName, shiftKey: props.shiftKey }))
}
function triggerKeyUp() {
	window.dispatchEvent(new KeyboardEvent('keyup', { key: props.keyName, shiftKey: props.shiftKey }))
}

function onKeyDown(e: KeyboardEvent) {
	if (e.key.toLowerCase() !== props.keyName.toLowerCase()) return
	buttonState.keyDown = true
	emit('keydown', props.keyName)
}
function onKeyUp(e: KeyboardEvent) {
	if (e.key.toLowerCase() !== props.keyName.toLowerCase()) return
	buttonState.keyDown = false
	emit('keyup', props.keyName)
}
onMounted(() => {
	window.addEventListener('keydown', onKeyDown)
	window.addEventListener('keyup', onKeyUp)
})
onUnmounted(() => {
	window.removeEventListener('keydown', onKeyDown)
	window.removeEventListener('keyup', onKeyUp)
})
</script>

<template>
	<div class="keyboard-button">
		<span class="action">{{ action }}</span>
		<button class="button" :class="{ 'button--key-down': buttonState.keyDown }" @mousedown="triggerKeyDown"
			@mouseup="triggerKeyUp">
			{{ buttonName ?? keyName }}
		</button>
	</div>
</template>

<style scoped>
.keyboard-button {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}

.action {
	font-size: 18px;
	margin-right: 12px;
	font-weight: bold;
}

.button {
	min-width: 48px;
}

.button--key-down {
	color: rgb(255, 204, 0);
}
</style>
