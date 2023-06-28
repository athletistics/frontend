<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "ListError",
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
  <tr v-if="state === LoadingStates.Error" class="table-row">
    <td :colspan="cols" class="table-cell">{{$t('comp.list.error')}}</td>
  </tr>
</template>

<style scoped>

</style>