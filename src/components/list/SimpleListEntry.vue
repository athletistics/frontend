<script lang="ts">
import {defineComponent, PropType} from "vue";

export default defineComponent({
  props: {
    to: {type: String as PropType<string | undefined>, required: false},
    enabled: {type: Boolean as PropType<boolean>, required: false, default: true}
  }
})
</script>

<template>
  <li v-if="to && enabled" data-testid="sle-link">
    <router-link :to="to" class="block hover:bg-main p-4 main-transition"><slot></slot></router-link>
  </li>
  <li v-else class="p-4" data-testid="sle-default">
    <slot></slot>
  </li>
</template>