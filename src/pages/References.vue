<template>
  <h1>{{ $t('page.references.title') }}</h1>

  <form class="with-label grid sm:grid-cols-2 gap-4">
    <div>
      <label>{{ $t('page.references.referenceType') }}</label>
      <div class="flex">
        <select v-model="typeId">
          <option v-for="t in dataStore.staticResultTypes" :value="t.id">{{
              $t('data.staticResultTypes.' + t.i18nType)
            }}
          </option>
        </select>
      </div>
    </div>

    <div>
      <div v-if="filteredCategories?.size">
        <label>{{ $t('page.references.ageCat') }}</label>
        <div class="flex">
          <select v-model="ageCategory">
            <option v-for="[k] in filteredCategories" :value="k">{{ k }}</option>
          </select>
        </div>
      </div>
    </div>
  </form>

  <SimpleTable :headers="['Discipline', 'M', 'W']" :state="state">
    <SimpleTableRow v-for="v in values">
      <SimpleTableCell>{{ v.discipline.i18nName ? $t('data.' + v.discipline.i18nName) : v.discipline.customName }}</SimpleTableCell>
      <SimpleTableCell>{{ v.m }}</SimpleTableCell>
      <SimpleTableCell>{{ v.w }}</SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

</template>

<script lang="ts">
import {defineComponent} from 'vue'

import SimpleTable from "@/components/list/SimpleTable.vue";
import SimpleTableCell from "@/components/list/SimpleTableCell.vue";
import SimpleTableRow from "@/components/list/SimpleTableRow.vue";
import {formatResult} from "@/plugins/Helper";
import {useDataStore} from "@/stores/data";
import Discipline from "@/types/Discipline";
import {LoadingStates} from "@/types/LoadingStates";

export default defineComponent({
  name: "References",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable},
  setup() {
    const dataStore = useDataStore()
    return {dataStore}
  },
  data() {
    return {
      ageCategory: "" as string,
      typeId: NaN ,
      state: LoadingStates.Empty as LoadingStates
    }
  },
  computed: {
    values() {
      const results = [] as { discipline: Discipline, m: string, w: string }[]
      const catM = this.filteredCategories?.get(this.ageCategory)?.get('M')
      const catW = this.filteredCategories?.get(this.ageCategory)?.get('W')

      this.dataStore.disciplines.forEach(d => {
        const valM = catM ? this.dataStore.getReferenceValue(d.id, catM, this.typeId) : undefined
        const valW = catW ? this.dataStore.getReferenceValue(d.id, catW, this.typeId) : undefined

        if (!valM && !valW) return

        results.push({
          discipline: d,
          m: valM ? formatResult(valM.value, d) : "-",
          w: valW ? formatResult(valW.value, d) : "-",
        })
      })

      return results
    },
    filteredCategories() {
      const catMap = new Map<string, Map<string, string>>()

      if (!this.typeId) return undefined

      this.dataStore.staticResults.forEach(r => {
        if (r.resultStaticTypeId !== this.typeId) return

        const c = this.dataStore.getCategoryById(r.categoryId)
        if (!c) return

        const name = c.name ? c.name : this.$t('glob.gender.M') + "/" + this.$t('glob.gender.W')

        if (!catMap.has(name)) catMap.set(name, new Map<string, string>())
        catMap.get(name)?.set(c.gender, c.id)
      })

      return catMap
    }
  },
  watch: {
    filteredCategories(newValue: Map<string, Map<string, string>>) {
      if (!newValue?.get(this.ageCategory)?.size) {
        this.state = LoadingStates.Empty
      }
    },
    values(newValues: { discipline: Discipline, m: string, w: string }[]){
      this.state = newValues.length ? LoadingStates.Loaded : LoadingStates.Empty
    }
  },
  mounted() {
    this.typeId = this.dataStore.staticResultTypes[0].id
  }
})
</script>

<style scoped>

</style>