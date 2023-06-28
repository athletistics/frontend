<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "ListEmpty",
  computed: {
    LoadingStates() {
      return LoadingStates
    }
  },
  props: {
    state: {type: Number as PropType<LoadingStates>, required: true},
    cols: {type: Number as PropType<number>, required: true}
  }
})
</script>

<template>
  <tr v-if="state === LoadingStates.Empty" class="table-row">
    <td :colspan="cols" class="table-cell">{{ $t('comp.list.empty') }}</td>
  </tr>
</template>

<style scoped>

</style>