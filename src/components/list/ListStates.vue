<script lang="ts">
import {defineComponent} from 'vue'
import ListEmpty from "./ListEmpty.vue";
import ListLoading from "./ListLoading.vue";
import ListError from "./ListError.vue";
import {PropType} from "vue/dist/vue";
import {LoadingStates} from "../../types/LoadingStates.ts";

export default defineComponent({
  name: "ListStates",
  components: {ListError, ListLoading, ListEmpty},
  props: {
    state: {type: Object as PropType<LoadingStates>, required: true},
  },
})
</script>

<template>
  <ListEmpty :state="state"/>
  <ListError :state="state"/>
  <ListLoading :state="state"/>
</template>

<style scoped>

</style>