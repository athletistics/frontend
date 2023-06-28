<script lang="ts">
import SimpleListLoading from "./SimpleListLoading.vue";
import {defineComponent, PropType} from "vue";
import {LoadingStates} from "../../types/LoadingStates";
import SimpleListEntry from "./SimpleListEntry.vue";

export default defineComponent({
  name: "ListStates",
  computed: {
    LoadingStates() {
      return LoadingStates
    }
  },
  components: {SimpleListEntry, SimpleListLoading},
  props: {
    state: {type: Number as PropType<LoadingStates>, required: true},
  },
})
</script>

<template>
  <ul role="list" class="my-2 divide-y divide-slate-200 white-rounded overflow-hidden">
    <slot></slot>

    <SimpleListLoading v-if="state===LoadingStates.Loading"/>
    <SimpleListEntry v-else-if="state===LoadingStates.Empty">{{ $t('comp.list.empty') }}</SimpleListEntry>
    <SimpleListEntry v-else-if="state===LoadingStates.Error">{{ $t('comp.list.error') }}</SimpleListEntry>
  </ul>
</template>

<style scoped>

</style>