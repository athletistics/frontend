<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "ListLoading",
  computed: {
    LoadingStates() {
      return LoadingStates
    }
  },
  props: {
    state: {type: Number as PropType<LoadingStates>, required: true}
  }
})
</script>

<template>
  <tbody v-if="state===LoadingStates.Loading">
  <tr class="table-row">
    <td colspan="4" class="table-cell">{{ $t('glob.list.loading') }}</td>
  </tr>
  </tbody>
</template>

<style scoped>

</style>