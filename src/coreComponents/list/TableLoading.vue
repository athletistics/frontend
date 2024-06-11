<template>
  <tr v-for="i in rows" :key="i" class="table-row animate-pulse">
    <td v-for="j in cols" :key="j" class="table-cell">
      <div class="h-3 my-1 bg-slate-200 rounded"></div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import {PropType} from 'vue'

defineProps({
  cols: {type: Number as PropType<number>, required: true},
  rows: {type: Number as PropType<number>, required: false, default: 4}
})
</script>

<style scoped>

</style>