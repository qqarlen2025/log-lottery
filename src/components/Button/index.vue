<template>
  <button :disabled="disabled" @click="onClick" class="btn">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

function onClick(e: Event) {
  if (!props.disabled) {
    emit('click', e)
  }
}
</script>

<style scoped>
.btn {
  padding: 6px 12px;
}
</style>