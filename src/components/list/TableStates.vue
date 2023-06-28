<script lang="ts">
import {defineComponent, PropType} from 'vue'
import ListEmpty from "./TableEmpty.vue";
import ListLoading from "./TableLoading.vue";
import ListError from "./TableError.vue";
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "ListStates",
  components: {ListError, ListLoading, ListEmpty},
  props: {
    state: {type: Number as PropType<LoadingStates>, required: true},
    cols: {type: Number as PropType<number>, required: true}
  },
})
</script>

<template>
  <ListEmpty :state="state" :cols="cols"/>
  <ListError :state="state" :cols="cols"/>
  <ListLoading :state="state" :cols="cols"/>
</template>

<style scoped>

</style>