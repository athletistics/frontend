<script setup lang="ts">
import {onMounted, Ref, ref} from "vue";
import {useI18n} from "vue-i18n";

import {useDataStore} from "@/stores/data";
import Discipline from "@/types/Discipline";

// data
const filteredDisciplines: Ref<Discipline[]> = ref([])
const value: Ref<Discipline | undefined> = ref()
const disciplines: Discipline[] = useDataStore().disciplines

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  inputClass: {type: Object, default() {return {}}}
})
defineEmits(['update:modelValue'])
const {t} = useI18n()

const search = (event: {query: string}): void => {
  if (event.query?.trim()?.length) {
    filteredDisciplines.value = disciplines.filter(d => {
      return t('data.' + d.i18nName)?.toLowerCase()?.startsWith(event.query.toLowerCase()) ||
          d.customName?.toLowerCase()?.startsWith(event.query.toLowerCase())
    })
  } else {
    filteredDisciplines.value = disciplines.filter(() => true)
  }
}
const optionLabel = (selectedUser: Discipline) : any => {
  return selectedUser.customName ?? t('data.' + selectedUser.i18nName)
}

onMounted(() => {
  if (props.modelValue) {
    value.value = disciplines.find(d => d.id === props.modelValue)
  }
})
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete
v-model="value" input-id="user" :suggestions="filteredDisciplines" :class="inputClass"
                  dropdown force-selection :option-label="optionLabel" :disabled="disabled"

                  @complete="search"
                  @update:modelValue="(newVal: Discipline) => $emit('update:modelValue', newVal?.id)">
      <template #empty>
        <div class="p-autocomplete-item">Nothing to see</div>
      </template>
      <template #option="slotProps">
        <div>{{ slotProps.option.customName ?? t('data.' + slotProps.option.i18nName) }}</div>
      </template>
    </AutoComplete>
    <label for="user">{{ $t('glob.discipline.name') }}</label>
  </span>
</template>

<style scoped>

</style>