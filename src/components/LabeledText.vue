<script lang="ts">
import {computed, defineComponent, PropType} from "vue";

export default defineComponent({
  props: {
    text: {type: String as PropType<string | undefined>, required: true},
    label: {type: String as PropType<string | undefined>, required: true}
  },
  computed: {
    animateClass() {
      return this.text ? "" : "animate-pulse"
    }
  }
})
</script>

<template>
  <div :class="animateClass">
    <p>{{$t(label)}}</p>
    <p v-if="text" class="font-argentum">{{text}}</p>
    <div v-else class="h-2 my-2 bg-slate-200 rounded"></div>
  </div>
</template>