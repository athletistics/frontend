<template>
  <SelectButton
      v-model="model" :options="options" :option-label="optionLabel" :option-value="optionValue" multiple
      :pt="{
        button: (options) => ({
              class: ['border-solid', 'border', 'mx-1', 'my-1', 'px-4', 'py-1', 'rounded-full',
              {'border-slate-300': !options.context.active, 'border-primary': options.context.active}]
        }),
        label: {class: ['font-normal', 'text-sm']}
      }"
  />
</template>

<script setup lang="ts">
import {PropType} from "vue";

const model = defineModel()

defineProps({
  options: {type: Array as PropType<any[]>, required: true},
  optionLabel: {type: String as PropType<string>, required: false},
  optionValue: {type: String as PropType<string>, required: false}
})
</script>

<style scoped>

</style>