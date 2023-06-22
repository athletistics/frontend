<template>
  <div class="bg-main hover:bg-main rounded-md transition duration-300 ease-in-out shadow-md text-left p-5">
    <div v-if="withUsers">
      <p class="text-xl font-bold font-argentum">{{ result.disciplineName }} - {{ formattedValue }}</p>
      <p class="text-xl font-argentum mt-5">{{ result.userLastName }} {{ result.userFirstName }}</p>
    </div>
    <div v-else>
      <p class="text-xl font-bold font-argentum">{{ result.disciplineName }}</p>
      <p class="text-xl font-argentum">{{ formattedValue }} <span
          v-if="result.wind">({{ $t('glob.result.wind') }}: {{ result.wind }})</span></p>
    </div>
    <p class="text-gray-500 mt-2">{{ $d(result.date) }}</p>
    <p class="text-gray-500">{{ result.eventName }}, {{ result.eventPlace }} -
      {{ result.eventOutdoor ? $t('glob.event.outdoor') : $t('glob.event.indoor') }}</p>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {formatResult} from "../../plugins/Helper.ts";
import {useDataStore} from "../../stores/data.ts";

export default defineComponent({
  name: "Card",
  setup() {
    const dataStore = useDataStore()
    return {dataStore}
  },
  props: {
    result: {type: Object as PropType<Result.Data>, required: true},
    withUsers: {type: Array as PropType<boolean>, default: true}
  },
  computed: {
    formattedValue(): string {
      this.dataStore.disciplineMapIsReady
      return formatResult(this.result.value, this.result.disciplineId)
    }
  }
})
</script>

<style scoped>

</style>