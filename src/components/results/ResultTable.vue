<template>
  <SimpleTable :headers="headers" :i18n="true" :state="state">
    <SimpleTableRow v-for="r in results">
      <SimpleTableCell v-if="showUser">{{ r.userLastName }} {{ r.userFirstName }}</SimpleTableCell>
      <SimpleTableCell v-if="showDisciplines" class="table-cell">{{
          te('data.' + r.disciplineName) ? $t('data.' + r.disciplineName) : r.disciplineName
        }}
      </SimpleTableCell>
      <SimpleTableCell>{{ getFormattedValue(r) }}</SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ r.eventName }} - {{
          r.eventOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor')
        }}
      </SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ $d(r.date) }}</SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ r.eventPlace }}</SimpleTableCell>
      <SimpleTableCell class="!py-0">
        <Button
            type="button" icon="pi pi-ellipsis-v" text rounded severity="secondary" size="small"
            @click="(event) => toggle(event, r)"/>
      </SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

  <Menu ref="menu" :model="items" :popup="true"/>
  <DialogResult ref="dialogResult" :result="selectedResult" :is-personal="false"/>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Menu from "primevue/menu";
import {MenuItem} from "primevue/menuitem";
import {useToast} from "primevue/usetoast";
import {computed, PropType, ref} from 'vue'
import {useI18n} from "vue-i18n";

import DialogResult from "@/components/dialogs/DialogResult.vue";
import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import {formatResult} from "@/plugins/Helper";
import {notImplemented} from "@/plugins/ToastWriter";
import {useDataStore} from "@/stores/data";
import IntDialog from "@/types/IntDialog";
import {LoadingStates} from "@/types/LoadingStates";

const props = defineProps({
  results: {type: Array as PropType<Result.Data[]>, required: true},
  showDisciplines: {type: Boolean, default: true},
  showUser: {type: Boolean, default: true},
  showEvent: {type: Boolean, default: true},
  state: {type: Number as PropType<LoadingStates>, default: LoadingStates.Loaded, required: false}
})

const dataStore = useDataStore()
const toast = useToast()
const {te} = useI18n()

const headers = computed((): string[] => {
  const h = [] as string[]
  if (props.showUser) h.push('glob.user.name')
  if (props.showDisciplines) h.push('glob.discipline.name')

  h.push('glob.result.name')

  if (props.showEvent) h.push('glob.event.name', 'glob.date', 'glob.event.place')
  return h
})

const getFormattedValue = computed((): Function => {
  return (result: Result.Data) => {
    return formatResult(result.value, dataStore.getDisciplineById(result.disciplineId))
  }
})

const dialogResult = ref<IntDialog>()
const selectedResult = ref<Result.RequestBody>()
const menu = ref<Menu>()
const items = ref<MenuItem[]>([
  {
    label: 'Update',
    icon: 'pi pi-pencil',
    command: () => void dialogResult.value?.setVisibility(true)
  },
  {separator: true},
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    class: 'danger',
    command: () => {
      if (selectedResult.value) toast.add(notImplemented('delete result'))
    }
  }
])
const toggle = (event: Event, r: Result.Data): void => {
  selectedResult.value = {
    id: r.id,
    value: r.value ? parseFloat(r.value) : 0,
    rank: r.rank,
    wind: r.wind ? parseFloat(r.wind) : undefined,
    disciplineId: r.disciplineId,
    userId: r.userId,
    eventId: r.eventId
  }
  menu.value?.toggle(event)
}
</script>

<style scoped>

</style>