<script lang="ts">
import BtnPlus from "../button/BtnPlus.vue";
import {defineComponent, PropType} from "vue";

export default defineComponent({
  components: {BtnPlus},
  props: {
    btnVisible: {type: Boolean as PropType<boolean>, required: false, default: false}
  }
})
</script>

<template>
  <div class="flex items-center">
    <h1 class="grow"><slot></slot></h1>
    <BtnPlus v-if="btnVisible" @click="$emit('btn-click')"/>
  </div>
</template>