<template>
  <SimpleTable :headers="headers" :i18n="true" :state="state">
    <SimpleTableRow v-for="r in results">
      <SimpleTableCell v-if="showUser">{{ r.userLastName }} {{ r.userFirstName }}</SimpleTableCell>
      <SimpleTableCell v-if="showDisciplines" class="table-cell">{{ r.disciplineName }}</SimpleTableCell>
      <SimpleTableCell>{{ getFormattedValue(r) }}</SimpleTableCell>
      <SimpleTableCell>{{ $d(r.date) }}</SimpleTableCell>
      <SimpleTableCell>{{ r.eventName }} - {{
          r.eventOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor')
        }}
      </SimpleTableCell>
      <SimpleTableCell>{{ r.eventPlace }}</SimpleTableCell>
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
  name: "ResultList",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable, ListStates},
  setup() {
    const dataStore = useDataStore()
    return {dataStore}
  },
  props: {
    results: {type: Array as PropType<Result.Data[]>, required: true},
    showDisciplines: {type: Boolean, default: true},
    showUser: {type: Boolean, default: true},
    state: {type: Number as PropType<LoadingStates>, default: LoadingStates.Loaded, required: false}
  },
  computed: {
    headers() {
      const h = ['glob.result.name', 'glob.event.name', 'glob.date', 'glob.event.place']
      if(this.showDisciplines) h.unshift('glob.discipline.name')
      if(this.showUser) h.unshift('glob.user.name')
      return h
    },
    LoadingStates() {
      return LoadingStates
    },
    getFormattedValue() {
      this.dataStore.disciplineMapIsReady
      return (result: Result.Data) => {
        return formatResult(result.value, result.disciplineId)
      }
    },
  },
})
</script>

<style scoped>

</style>