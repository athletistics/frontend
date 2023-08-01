<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  name: "ListLoading",
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
  <tr v-if="state===LoadingStates.Loading" v-for="i in 4" class="table-row animate-pulse">
    <td v-for="i in cols" class="table-cell"><div class="h-3 my-1 bg-slate-200 rounded"></div></td>
  </tr>
</template>

<style scoped>

</style>