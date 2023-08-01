<script lang="ts">
import TableStates from "./TableStates.vue";
import {defineComponent, PropType} from "vue";
import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  components: {TableStates},
  props: {
    headers: {type: Array as PropType<string[]>, required: true},
    i18n: {type: Boolean as PropType<boolean>, required: false, default: false},
    state: {type: Number as PropType<LoadingStates>, required: false, default: LoadingStates.Loaded}
  }
})
</script>

<template>
  <div class="overflow-x-scroll my-2 white-rounded">
    <table class="min-w-full">
      <thead class="border-b">
      <tr>
        <th scope="col" class="table-head" v-for="h in headers">{{ i18n && h ? $t(h) : h }}</th>
      </tr>
      </thead>
      <tbody>
      <slot></slot>

      <TableStates :state="state" :cols="headers.length"/>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>