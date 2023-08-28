<script setup lang="ts">
import {PropType} from 'vue'

defineProps({
  cols: {type: Number as PropType<number>, required: true}
})
</script>

<template>
  <tr class="table-row">
    <td :colspan="cols" class="table-cell">{{ $t('comp.list.empty') }}</td>
  </tr>
</template>

<style scoped>

</style>