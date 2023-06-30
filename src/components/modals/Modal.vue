<template>
  <div class="fixed top-0 left-0 w-full h-full backdrop-blur flex items-center" :class="visibility">
    <div class="rounded-md shadow-xl bg-white sm:mx-auto mx-4 my-10 p-5 container w-full relative" :class="classes">
      <button @click="setVisibility(false)" class="absolute right-0 mr-5">
        <font-awesome-icon icon="fa-xmark"></font-awesome-icon>
      </button>
      <div class="flex flex-col space-y-4 h-full">
        <div class="flex-shrink overflow-scroll">
          <slot/>
        </div>
        <slot name="bottom"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue";

export default defineComponent({
  name: "Modal",
  props: {
    classes: {type: String as PropType<string>, required: false, default: "sm:max-w-sm"}
  },
  data() {
    return {
      visible: false as boolean
    }
  },
  methods: {
    setVisibility(visible: boolean) {
      this.visible = visible
    }
  },
  computed: {
    visibility() {
      return {
        "invisible": !this.visible
      }
    },
  },
  created() {
    let that = this
    document.addEventListener('keyup', function (e) {
      if (e.key === "Escape") {
        that.setVisibility(false)
      }
    })
  }
})
</script>

<style scoped>

</style>