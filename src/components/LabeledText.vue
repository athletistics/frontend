<script lang="ts">
import {defineComponent, PropType} from "vue";
import {LoadingStates} from "../types/LoadingStates";

export default defineComponent({
  props: {
    text: {type: String as PropType<string>, required: false},
    label: {type: String as PropType<string>, required: true},
    state: {type: Number as PropType<LoadingStates>, required: false, default: LoadingStates.Loaded}
  },
  computed: {
    LoadingStates() {
      return LoadingStates
    },
    animateClass() {
      return this.state === LoadingStates.Loading ? "animate-pulse" : ""
    },
    visualClass() {
      switch (this.state) {
        case LoadingStates.Error:
          return "bg-red-200"
        case LoadingStates.Loading:
          return "bg-slate-200"
      }
    }
  }
})
</script>

<template>
  <div :class="animateClass">
    <p>{{$t(label)}}</p>
    <p v-if="state === LoadingStates.Loaded" class="font-argentum">{{text ? text : "-"}}</p>
    <div v-else class="h-2 my-2 rounded" :class="visualClass"></div>
  </div>
</template>