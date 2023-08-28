<script lang="ts">
import {defineComponent, PropType} from "vue";

import SimpleListEntry from "./SimpleListEntry.vue";

export default defineComponent({
  components: {SimpleListEntry},
  props: {
    entries: {type: Number as PropType<number>, default: 3}
  }
})
</script>

<template>
  <SimpleListEntry v-for="() in entries" class="animated-pulse">
    <div class="h-2 my-2 bg-slate-200 rounded"></div>
  </SimpleListEntry>
</template>

<style scoped>

</style>