<script lang="ts">
import {defineComponent, PropType} from "vue";

import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  props: {
    text: {type: String as PropType<string>, required: false, default: ""},
    label: {type: String as PropType<string>, required: false, default: ""},
    state: {type: Number as PropType<LoadingStates>, required: false, default: LoadingStates.Loaded}
  },
  computed: {
    slotEmpty() {
      return !this.$slots.default
    },
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
      return ""
    },
    content() {
      if (!this.slotEmpty) return ""
      if (this.text?.trim()) return this.text
      return "-"
    }
  }
})
</script>

<template>
  <div :class="animateClass">
    <p>{{ label ? $t(label) : '' }}</p>
    <p v-if="state === LoadingStates.Loaded" class="font-argentum">{{ content }}
      <slot/>
    </p>
    <div v-else class="h-2 my-2 rounded" :class="visualClass"></div>
  </div>
</template>