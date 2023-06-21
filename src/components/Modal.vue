<template>
  <div class="fixed top-0 left-0 w-full h-full backdrop-blur flex items-center" :class="visibility">
    <div class="rounded-md shadow-xl bg-white sm:mx-auto mx-10 p-5 max-h-full overflow-scroll sm:w-96 w-full relative">
      <button @click="setVisibility(false)" class="absolute right-0 mr-5">
        <font-awesome-icon icon="fa-xmark"></font-awesome-icon>
      </button>
      <form class="space-y-4 with-label">
        <slot/>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "Modal",
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
    }
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