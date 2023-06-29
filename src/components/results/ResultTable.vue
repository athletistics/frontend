<template>
  <SimpleTable :headers="headers" :i18n="true" :state="state">
    <SimpleTableRow v-for="r in results">
      <SimpleTableCell v-if="showUser">{{ r.userLastName }} {{ r.userFirstName }}</SimpleTableCell>
      <SimpleTableCell v-if="showDisciplines" class="table-cell">{{ r.disciplineName }}</SimpleTableCell>
      <SimpleTableCell>{{ getFormattedValue(r) }}</SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ r.eventName }} - {{
          r.eventOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor')
        }}
      </SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ $d(r.date) }}</SimpleTableCell>
      <SimpleTableCell v-if="showEvent">{{ r.eventPlace }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "../../types/LoadingStates";
import {formatResult} from "../../plugins/Helper";
import {useDataStore} from "../../stores/data";
import ListStates from "../list/TableStates.vue";
import SimpleTable from "../list/SimpleTable.vue";
import SimpleTableRow from "../list/SimpleTableRow.vue";
import SimpleTableCell from "../list/SimpleTableCell.vue";

export default defineComponent({
  name: "ResultTable",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable, ListStates},
  setup() {
    const dataStore = useDataStore()
    return {dataStore}
  },
  props: {
    results: {type: Array as PropType<Result.Data[]>, required: true},
    showDisciplines: {type: Boolean, default: true},
    showUser: {type: Boolean, default: true},
    showEvent: {type: Boolean, default: true},
    state: {type: Number as PropType<LoadingStates>, default: LoadingStates.Loaded, required: false}
  },
  computed: {
    headers() {
      const h = [] as string[]
      if(this.showUser) h.push('glob.user.name')
      if(this.showDisciplines) h.push('glob.discipline.name')

      h.push('glob.result.name')

      if(this.showEvent) h.push('glob.event.name', 'glob.date', 'glob.event.place')
      return h
    },
    LoadingStates() {
      return LoadingStates
    },
    getFormattedValue() {
      this.dataStore.maps.disciplines?.size
      return (result: Result.Data) => {
        return formatResult(result.value, result.disciplineId)
      }
    },
  },
})
</script>

<style scoped>

</style>