<script lang="ts">
import {defineComponent, PropType} from "vue";

import {LoadingStates} from "@/types/LoadingStates";

import TableStates from "./TableStates.vue";

export default defineComponent({
  components: {TableStates},
  props: {
    headers: {type: Array as PropType<string[]>, required: true},
    i18n: {type: Boolean as PropType<boolean>, required: false, default: false},
    state: {type: Number as PropType<LoadingStates>, required: false, default: LoadingStates.Loaded},
    rows: {type: Number as PropType<number>, required: false, default: 4}
  },
  computed: {
    LoadingStates() {
      return LoadingStates
    }
  }
})
</script>

<template>
  <div class="overflow-x-scroll my-2 white-rounded">
    <table class="min-w-full">
      <thead class="border-b">
      <tr>
        <th v-for="h in headers" scope="col" class="table-head">{{ i18n && h ? $t(h) : h }}</th>
      </tr>
      </thead>
      <tbody>
      <slot v-if="state===LoadingStates.Loaded"></slot>

      <TableStates :state="state" :cols="headers.length" :rows="rows"/>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>