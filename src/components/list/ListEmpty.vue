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
    state: {type: Object as PropType<LoadingStates>, required: true}
  }
})
</script>

<template>
  <tbody v-if="state === LoadingStates.Empty">
  <tr class="table-row">
    <td colspan="4" class="table-cell">{{ $t('glob.list.empty') }}</td>
  </tr>
  </tbody>
</template>

<style scoped>

</style>