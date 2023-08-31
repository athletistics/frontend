<template>
  <div class="flex items-center">
    <h1 class="grow">
      <slot></slot>
    </h1>
    <Button
        v-if="btnVisible" type="button" icon="pi pi-ellipsis-v" outlined rounded severity="secondary"
        @click="toggle"/>
    <Menu ref="menu" :model="computedItems" :popup="true"/>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Menu from "primevue/menu";
import {MenuItem} from "primevue/menuitem";
import {computed, PropType, ref} from "vue";

const props = defineProps({
  btnVisible: {type: Boolean as PropType<boolean>, required: false, default: false},
  items: {type: Array as PropType<MenuItem[]>, required: false, default: undefined}
})

const emits = defineEmits(['edit', 'delete'])

const computedItems = computed((): MenuItem[] => {
  if (props.items) return props.items

  return [
    {
      label: 'Edit',
      icon: 'pi pi-pencil',
      command: () => emits('edit')
    },
    {separator: true},
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      class: 'danger',
      command: () => emits('delete')
    }
  ]
})

const menu = ref<Menu>();

const toggle = (event: Event): void => {
  menu.value?.toggle(event)
}
</script>

<style>
.danger a .p-menuitem-icon, .danger a .p-menuitem-text {
  @apply !text-red-600
}
</style>