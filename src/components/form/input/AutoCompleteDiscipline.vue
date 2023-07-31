<script setup lang="ts">
import {useDataStore} from "../../../stores/data";
import {onMounted, Ref, ref, watch} from "vue";
import Discipline from "../../../types/Discipline";
import {useI18n} from "vue-i18n";

// data
const filteredDisciplines: Ref<Discipline[]> = ref([])
const value: Ref<Discipline | undefined> = ref()
const disciplines: Discipline[] = useDataStore().disciplines

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  inputClass: {type: Object, default: {}}
})
const emit = defineEmits(['update:modelValue'])
const {t} = useI18n()

const search = (event: any) => {
  if (event.query?.trim()?.length) {
    filteredDisciplines.value = disciplines.filter(d => {
      return t('data.' + d.i18nName)?.toLowerCase()?.startsWith(event.query.toLowerCase()) ||
          d.customName?.toLowerCase()?.startsWith(event.query.toLowerCase())
    })
  } else {
    filteredDisciplines.value = disciplines.filter(_ => true)
  }
}
const optionLabel = (selectedUser: Discipline) => {
  return selectedUser.customName ?? t('data.' + selectedUser.i18nName)
}
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete inputId="user" :suggestions="filteredDisciplines" @complete="search" :class="inputClass"
                  dropdown forceSelection :optionLabel="optionLabel" :disabled="disabled"

                  v-model="value"
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