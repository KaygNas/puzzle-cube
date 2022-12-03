<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
	action: string
	keyName: string
	buttonName?: string
	capsLock?: boolean
}>()
const emit = defineEmits<{
	(e: 'keydown', key: string): void
	(e: 'keyup', key: string): void
	(e: 'pressed', key: string): void
}>()

const buttonState = reactive({ keyDown: false })
const keyName = computed(() => nomarlizeCase(props.keyName))

function nomarlizeCase(key: string) {
	return props.capsLock ? key.toUpperCase() : key.toLowerCase()
}

function triggerKeyDown() {
	window.dispatchEvent(new KeyboardEvent('keydown', { key: keyName.value }))
}
function triggerKeyUp() {
	window.dispatchEvent(new KeyboardEvent('keyup', { key: keyName.value }))
}

function onKeyDown(e: KeyboardEvent) {
	if (nomarlizeCase(e.key) !== keyName.value) return
	buttonState.keyDown = true
	emit('keydown', keyName.value)
}
function onKeyUp(e: KeyboardEvent) {
	if (nomarlizeCase(e.key) !== keyName.value) return
	buttonState.keyDown = false
	emit('keyup', keyName.value)
	emit('pressed', keyName.value)
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
		<button
			class="button"
			:class="{ 'button--key-down': buttonState.keyDown }"
			@mousedown="triggerKeyDown"
			@mouseup="triggerKeyUp"
		>
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
