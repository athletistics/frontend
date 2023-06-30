<script lang="ts">
import {defineComponent, PropType} from 'vue'
import LoadingState from "../../types/LoadingState";
import {LoadingStates} from "../../types/LoadingStates";

export default defineComponent({
  name: "LoadingBtn",
  props: {
    disabled: {type: Boolean as PropType<boolean>, required: false, default: false},
    full: {type: Boolean as PropType<boolean>, required: false, default: false},
    outlined: {type: Boolean as PropType<boolean>, required: false, default: false},
    loading: {type: Object as PropType<LoadingState>, required: false, default: {state: LoadingStates.Loaded}},
    type: {type: String as PropType<string>, required: false, default: "button"},
    visualType: {type: String as PropType<string>, required: false}
  },
  computed: {
    isDisabled() {
      return this.disabled || this.loading.state === LoadingStates.Loading
    },
    isLoading() {
      return this.loading.state === LoadingStates.Loading
    },
    classes() {
      let additionalClasses = []
      if (this.isDisabled) additionalClasses.push("cursor-not-allowed")
      if (this.full) additionalClasses.push("w-full", "text-center")

      switch (this.visualType) {
        case "primary":
          additionalClasses.push(this.outlined ? "btn-primary" : "btn-primary-filled")
          break
        case "warning":
          additionalClasses.push(this.outlined ? "btn-warning" : "btn-warning-filled")
          break
        case "error":
          additionalClasses.push(this.outlined ? "btn-error" : "btn-error-filled")
          break
        default:
          additionalClasses.push(this.outlined ? "btn-default" : "btn-default-filled")
      }

      return additionalClasses.join(" ")
    }
  }
})
</script>

<template>
  <button :type="type" class="main-transition p-3 rounded-full font-semibold block" :class="classes" :disabled="isDisabled">
    <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24">
      <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
      <path fill="#ffffff"
            d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"/>
    </svg>
    <slot></slot>
  </button>
</template>

<style scoped>
.btn-block {
  @apply block w-full text-center;
}

.btn-primary {
  @apply border-2 border-primary disabled:border-primary-variant-200
  disabled:bg-transparent hover:bg-primary
  text-black disabled:text-gray-400 hover:text-white;
}

.btn-primary-filled {
  @apply bg-primary disabled:bg-primary-variant-300 hover:bg-primary-variant-800 text-white
}

.btn-warning {
  @apply border-2 border-yellow-500 disabled:border-yellow-200
  disabled:bg-transparent hover:bg-yellow-500
  text-black disabled:text-gray-400;
}

.btn-warning-filled {
  @apply bg-yellow-500 disabled:bg-yellow-300 hover:bg-yellow-600 text-black;
}

.btn-error {
  @apply border-2 border-red-500 disabled:border-red-200
  disabled:bg-transparent hover:bg-red-500
  text-black disabled:text-gray-400;
}

.btn-error-filled {
  @apply bg-red-500 disabled:bg-red-300 hover:bg-red-600 text-black
}

.btn-default {
  @apply border-2 border-gray-300 disabled:border-gray-200 disabled:bg-transparent hover:bg-gray-300
  disabled:text-gray-400 text-black;
}

.btn-default-filled {
  @apply bg-gray-300 disabled:bg-gray-200 hover:bg-gray-400;
}

</style>