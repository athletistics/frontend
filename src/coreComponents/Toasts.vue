<script lang="ts">
import {mapState} from "pinia";
import {defineComponent} from "vue";

import {useToastStore} from "@/stores/toast";

import Toast from './Toast.vue'

export default defineComponent({
  name: 'Toasts',
  components: { Toast },
  computed: {
    ...mapState(useToastStore, ['toasts'])
  }
})
</script>

<template>
  <div v-if="toasts.length" class="toasts-wrapper z-50">
    <Toast v-for="t in toasts" :toast="t"></Toast>
  </div>
</template>

<style scoped>
.toasts-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  right: 2rem;
  bottom: 1rem;
}
</style>