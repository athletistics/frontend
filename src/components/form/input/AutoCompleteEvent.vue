<script setup lang="ts">
import {useDataStore} from "@/stores/data";
import {onMounted, Ref, ref} from "vue";
import Event from "@/types/Event";
import {useI18n} from "vue-i18n";

// data
const filteredEvents: Ref<Event[]> = ref([])
const value: Ref<Event | undefined> = ref()
const events: Event[] = useDataStore().events

const props = defineProps({
  modelValue: {type: String, default: ''},
  disabled: {type: Boolean, default: false},
  inputClass: {type: Object, default: {}},
  isPersonal: {type: Boolean, default: false}
})
const emits = defineEmits(['update:modelValue'])
const {d} = useI18n()

const search = (event: any) => {
  if (event.query?.trim()?.length) {
    filteredEvents.value = events.filter(e => {
      return (
          e.name.toLowerCase().startsWith(event.query.toLowerCase()) ||
          e.place.toLowerCase().startsWith(event.query.toLowerCase())
      ) && (
          // shown only training events if an athlete adds a personal result
          props.isPersonal ? e.eventTypeId === 4 : true
      )
    })
  } else {
    filteredEvents.value = events.filter(e => props.isPersonal ? e.eventTypeId === 4 : true)
  }
}
const optionLabel = (selectedEvent: Event) => {
  return `${selectedEvent.name}, ${selectedEvent.place} (${d(selectedEvent.date)})`
}

onMounted(() => {
  if (props.modelValue) {
    value.value = events.find(e => e.id === props.modelValue)
  }
})
</script>

<template>
  <span class="p-float-label p-fluid">
    <AutoComplete inputId="user" :suggestions="filteredEvents" @complete="search" :class="inputClass"
                  dropdown forceSelection :optionLabel="optionLabel" :disabled="disabled"

                  v-model="value"
                  @update:modelValue="(newVal: Event) => $emit('update:modelValue', newVal?.id)">
      <template #empty>
        <div class="p-autocomplete-item">Nothing to see</div>
      </template>
      <template #option="slotProps">
        <div>{{ slotProps.option.name }}, {{ slotProps.option.place }} ({{ d(slotProps.option.date) }})</div>
      </template>
    </AutoComplete>
    <label for="user">{{ $t('glob.event.name') }}</label>
  </span>
</template>

<style scoped>

</style>