<template>
  <div class="overflow-x-scroll">
    <table class="min-w-full">
      <thead class="border-b">
      <tr>
        <th v-if="showUser" scope="col" class="table-head">{{ $t('glob.user.name') }}Athlet</th>
        <th v-if="showDisciplines" scope="col" class="table-head">{{ $t('glob.discipline.name') }}</th>
        <th scope="col" class="table-head">{{ $t('glob.date') }}</th>
        <th scope="col" class="table-head">{{ $t('glob.event.name') }}</th>
        <th scope="col" class="table-head">{{ $t('glob.event.place') }}</th>
        <th scope="col" class="table-head">{{ $t('glob.result.name') }}</th>
      </tr>
      </thead>
      <tbody v-if="state===LoadingStates.Loaded">
      <tr v-for="(result) in results" class="table-row">
        <td v-if="showUser">{{ result.userLastName }} {{ result.userFirstName }}</td>
        <td v-if="showDisciplines" class="table-cell">{{ result.disciplineName }}</td>
        <td class="table-cell">{{ $d(result.date) }}</td>
        <td class="table-cell">{{ result.eventName }} -
          {{ result.eventOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor') }}
        </td>
        <td class="table-cell">{{ result.eventPlace }}</td>
        <td class="table-cell">{{ getFormattedValue(result) }}</td>
      </tr>
      </tbody>

      <ListStates :state="state"/>
    </table>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {LoadingStates} from "../../types/LoadingStates.ts";
import {formatResult} from "../../plugins/Helper.ts";
import {useDataStore} from "../../stores/data.ts";
import ListStates from "../list/ListStates.vue";

export default defineComponent({
  name: "ResultList",
  components: {ListStates},
  setup() {
    const dataStore = useDataStore()
    return {dataStore}
  },
  props: {
    results: {type: Array as PropType<Result.Data[]>, required: true},
    showDisciplines: {type: Boolean, default: true},
    showUser: {type: Boolean, default: true},
    state: {type: Object as PropType<LoadingStates>, default: LoadingStates.Loaded, required: false}
  },
  computed: {
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