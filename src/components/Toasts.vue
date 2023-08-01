<script lang="ts">
import Toast from './Toast.vue'
import {defineComponent} from "vue";
import {mapState} from "pinia";

import {useToastStore} from "@/stores/toast";

export default defineComponent({
  name: 'Toasts',
  components: { Toast },
  computed: {
    ...mapState(useToastStore, ['toasts'])
  }
})
</script>

<template>
  <div class="toasts-wrapper z-50" v-if="toasts.length">
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