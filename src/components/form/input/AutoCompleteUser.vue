<script setup lang="ts">
import {useDataStore} from "../../../stores/data";
import {ref} from "vue";
import User from "../../../types/User";

// data
const filteredUsers = ref([])
const value = undefined

const users = useDataStore().users

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false}
})
const emit = defineEmits(['update:modelValue'])

const search = (event) => {
  if (!event.query.trim().length) {
    filteredUsers.value = users
  } else {
    filteredUsers.value = users.filter(u => {
      return u.firstName.toLowerCase().startsWith(event.query.toLowerCase()) ||
          u.lastName.toLowerCase().startsWith(event.query.toLowerCase())
    })
  }
}
const optionLabel = (selectedUser: User) => {
  return `${selectedUser.lastName} ${selectedUser.firstName}`
}
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete inputId="user" :suggestions="filteredUsers" @complete="search"
                  dropdown forceSelection dataKey="id" :optionLabel="optionLabel" :disabled="disabled"

                  :modelValue="value"
                  @update:modelValue="newVal => {
                    value = newVal
                    $emit('update:modelValue', newVal?.id)
                  }">
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