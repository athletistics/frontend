<script setup lang="ts">
import {useDataStore} from "../../../stores/data";
import {Ref, ref} from "vue";
import User from "../../../types/User";

// data
const filteredUsers: Ref<User[]> = ref([])
const value: Ref<User | undefined> = ref()

const users: User[] = useDataStore().users

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  inputClass: {type: Object, default: {}}
})
const emit = defineEmits(['update:modelValue'])

const search = (event: any) => {
  if (event.query?.trim()?.length) {
    filteredUsers.value = users.filter(u => {
      return u.firstName.toLowerCase().startsWith(event.query.toLowerCase()) ||
          u.lastName.toLowerCase().startsWith(event.query.toLowerCase())
    })
  } else {
    filteredUsers.value = users.filter(_ => true)
  }
}
const optionLabel = (selectedUser: User) => {
  return `${selectedUser.lastName} ${selectedUser.firstName}`
}
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete inputId="user" :suggestions="filteredUsers" @complete="search" :class="inputClass"
                  dropdown forceSelection :optionLabel="optionLabel" :disabled="disabled"

                  v-model="value"
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