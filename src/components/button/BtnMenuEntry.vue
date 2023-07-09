<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "BtnMenuEntry"
})
</script>

<template>
  <button class="block px-4 py-2 w-full text-left bg-transparent hover:bg-slate-200 main-transition">
    <slot/>
  </button>
</template>

<style scoped>

</style>