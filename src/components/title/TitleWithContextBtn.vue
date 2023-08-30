<template>
  <div class="flex items-center">
    <h1 class="grow">
      <slot></slot>
    </h1>
    <Button v-if="btnVisible" type="button" icon="pi pi-ellipsis-v" outlined rounded severity="secondary" @click="toggle"/>
    <Menu ref="menu" :model="items" :popup="true" />
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Menu from "primevue/menu";
import {MenuItem} from "primevue/menuitem";
import {PropType, ref} from "vue";

defineProps({
  btnVisible: {type: Boolean as PropType<boolean>, required: false, default: false}
})

const emits = defineEmits(['edit', 'delete'])

const menu = ref<Menu>();
const items = ref<MenuItem[]>([
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => emits('edit')
  },
  { separator: true },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    class: 'danger',
    command: () => emits('delete')
  }
])

const toggle = (event: Event) : void => {
  menu.value.toggle(event)
}
</script>

<style>
.danger a .p-menuitem-icon, .danger a .p-menuitem-text {
  @apply !text-red-600
}
</style>