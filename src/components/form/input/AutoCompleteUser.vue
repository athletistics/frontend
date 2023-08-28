<script setup lang="ts">
import {onMounted,Ref, ref} from "vue";

import {useDataStore} from "@/stores/data";
import User from "@/types/User";

// data
const filteredUsers: Ref<User[]> = ref([])
const value: Ref<User | undefined> = ref()

const users: User[] = useDataStore().users

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  inputClass: {type: Object, default() {return {}}}
})
defineEmits(['update:modelValue'])

const search = (event: {query: string}) : void => {
  if (event.query?.trim()?.length) {
    filteredUsers.value = users.filter(u => {
      return u.firstName.toLowerCase().startsWith(event.query.toLowerCase()) ||
          u.lastName.toLowerCase().startsWith(event.query.toLowerCase())
    })
  } else {
    filteredUsers.value = users.filter(() => true)
  }
}
const optionLabel = (selectedUser: User) : any => {
  return `${selectedUser.lastName} ${selectedUser.firstName}`
}

onMounted(() => {
  if (props.modelValue) {
    value.value = users.find(u => u.id === props.modelValue)
  }
})
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete
v-model="value" input-id="user" :suggestions="filteredUsers" :class="inputClass"
                  dropdown force-selection :option-label="optionLabel" :disabled="disabled"

                  @complete="search"
                  @update:modelValue="(newVal: User) => $emit('update:modelValue', newVal?.id)">
      <template #empty>
        <div class="p-autocomplete-item">Nothing to see</div>
      </template>
      <template #option="slotProps">
        <div>{{ slotProps.option.lastName }} {{ slotProps.option.firstName }}</div>
      </template>
    </AutoComplete>
    <label for="user">{{ $t('glob.user.name') }}</label>
  </span>
</template>

<style scoped>

</style>