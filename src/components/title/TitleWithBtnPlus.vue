<script setup lang="ts">
import BtnPlus from "../button/BtnPlus.vue";
</script>

<template>
  <div class="flex items-center">
    <h1 class="grow"><slot></slot></h1>
    <BtnPlus @click="$emit('click')"/>
  </div>
</template>