<script lang="ts">
import {defineComponent, PropType} from "vue";

export default defineComponent({
  props: {
    clickable: {type: Boolean as PropType<boolean>, required: false, default: false},
  }
})
</script>

<template>
  <tr v-if="clickable" class="table-row cursor-pointer" @click="$emit('click')">
    <slot></slot>
  </tr>
  <tr v-else class="table-row">
    <slot></slot>
  </tr>
</template>

<style scoped>

</style>