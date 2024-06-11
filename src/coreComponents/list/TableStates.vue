<script lang="ts">
import {defineComponent, PropType} from 'vue'

import {LoadingStates} from "@/types/LoadingStates";

import ListEmpty from "./TableEmpty.vue";
import ListError from "./TableError.vue";
import ListLoading from "./TableLoading.vue";

export default defineComponent({
  name: "TableStates",
  components: {ListError, ListLoading, ListEmpty},
  props: {
    state: {type: Number as PropType<LoadingStates>, required: true},
    cols: {type: Number as PropType<number>, required: true},
    rows: {type: Number as PropType<number>, required: false, default: 4}
  },
  computed: {
    LoadingStates() {
      return LoadingStates
    }
  },
})
</script>

<template>
  <ListEmpty v-if="state===LoadingStates.Empty" :cols="cols"/>
  <ListError v-else-if="state===LoadingStates.Error" :cols="cols"/>
  <ListLoading v-else-if="state===LoadingStates.Loading" :cols="cols" :rows="rows"/>
</template>

<style scoped>

</style>