<script lang="ts">
import SimpleListEntry from "./SimpleListEntry.vue";
import {defineComponent, PropType} from "vue";

export default defineComponent({
  components: {SimpleListEntry},
  props: {
    entries: {type: Number as PropType<number>, default: 3}
  }
})
</script>

<template>
  <SimpleListEntry v-for="i in entries" class="animated-pulse">
    <div class="h-2 my-2 bg-slate-200 rounded"></div>
  </SimpleListEntry>
</template>

<style scoped>

</style>