<script lang="ts">
import {defineComponent, PropType} from 'vue'
import Toast from '../types/Toast'
import {useToastStore} from "../stores/toast";

export default defineComponent({
  name: "Toast",
  props: {
    toast: {required: true, type: Object as PropType<Toast>}
  },
  setup() {
    const toastStore = useToastStore()

    return {toastStore}
  },
  created() {
    setTimeout(() => {
      this.dismissToast();
    }, 5000);
  },
  methods: {
    dismissToast() {
      this.toastStore.clearToast(this.toast.title);
    }
  }
})
</script>

<template>
  <div class="toast">
    <div class="sidebar" :class="toast.color"></div>
    <div class="content">
      <div class="header">
        <p class="title">{{ toast.title }} <span v-if="toast.code">({{ toast.code }})</span></p>
        <button @click="dismissToast">X</button>
      </div>
      <div class="text">
        <p>{{ toast.message }}</p>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --cream: #faf8f7;
  --light-grey: #e7e7e7;
  --grey: #cccccc;
  --white: #FFFFFF;
}

.toast {
  width: 500px;
  min-height: 50px;
  display: flex;
  flex-direction: row;
  margin-bottom: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  background-color: var(--cream);
  justify-content: center;
  border-top-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  border-top-right-radius: .5rem;
  box-shadow: 0 0 .5rem var(--grey);
}

.toast .title {
  font-weight: 700;
  font-size: 1.4em;
  font-family: "ArgentumNovus", Roboto, Avenir, Helvetica, Arial, sans-serif;
}

.toast p {
  font-weight: 100;
}

.toast .sidebar {
  width: .5rem;
}

.toast .content, .toast .header, .toast .text {
  width: 100%;
  display: flex;
}

.toast .content {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 1rem;
  box-sizing: border-box;
}

.toast .header, .toast .text {
  flex-direction: row;
  justify-content: flex-start;
  text-align: left;
}

.toast .header {
  height: 25px;
  margin-bottom: 1rem;
}

.toast .header button {
  margin-left: auto;
  text-decoration: none;
  border: none;
  cursor: pointer;
  background: none;
  font-size: 1rem;
}

.toast .header button:hover {
  background: var(--light-grey);
}

.toast .content {
  flex-grow: 1;
}
</style>