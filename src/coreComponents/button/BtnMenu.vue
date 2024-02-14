<template>
  <div class="relative inline-block">
    <button
ref="menuBtn" class="rounded-full hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-200 h-8 w-8 flex items-center main-transition duration-75"
            @click="toggleMenu">
      <font-awesome-icon icon="fa-ellipsis-vertical" class="mx-auto" size="1x"/>
    </button>

    <Teleport to="body">
      <div
class="absolute w-full h-full top-0 left-0" :class="{'invisible': !isMenuOpen}"
           @click.stop="handleClickOutside">
        <div
ref="menu" class="relative z-10 bg-slate-100 rounded-md shadow-xl overflow-hidden w-fit"
             :style="style">
          <slot/>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "BtnMenu",

  data() {
    return {
      isMenuOpen: false,
      top: 0 as number,
      right: 0 as number,
      style: {top: "", left: ""}
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    updatePosition() {
      let el: HTMLElement | null | undefined = this.$refs.menuBtn as HTMLElement

      const btnHeight = el.clientHeight
      const menuWidth = (this.$refs.menu as HTMLElement).clientWidth
      this.style.left = Math.min(el.getBoundingClientRect().right, window.innerWidth) - menuWidth + 'px'

      // iterate through all parents to get the absolute distance from the top of the page
      let top = 0
      do {
        top += el.offsetTop || 0;
        el = el.offsetParent?.parentElement;
      } while (el);

      this.style.top = top + btnHeight + 'px'
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      this.updatePosition()
    },
    handleClickOutside() {
      this.isMenuOpen = false;
    },
    handleResize() {
      this.updatePosition()
    }
  }
})
</script>

<style scoped>

</style>