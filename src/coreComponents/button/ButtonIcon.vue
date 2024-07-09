<template>
  <Button
      class="p-0 icon-button"
      :icon="icon"
      :severity="severity"
      size="small"
      text plain rounded
      :loading="loading"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import {PropType} from "vue";

defineProps({
  icon: {type: String as PropType<string | undefined>, required: true},
  loading: {type: Boolean as PropType<boolean>, required: false, default: false},
  severity: {
    type: String as PropType<"secondary" | "success" | "info" | "warning" | "help" | "danger" | "contrast">,
    required: true
  },
})
</script>

<style scoped>
.icon-button {
  width: 2.5em;
  height: 2.5em;
}
</style>