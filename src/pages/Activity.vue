<template>
  <h1>{{ $t('page.activity.title.default') }}</h1>

  <div class="white-rounded p-4 grid lg:grid-cols-3 sm:grid-cols-2 gap-4">
    <LabeledText label="page.activity.starDate" :state="activityState">{{ $d(activity.startDate) }}</LabeledText>
    <LabeledText label="page.activity.endDate" :state="activityState">{{ $d(activity.endDate) }}</LabeledText>
    <LabeledText label="page.activity.weekday" :state="activityState">{{ activity.weekday }}</LabeledText>
    <LabeledText label="page.activity.startTime" :state="activityState">{{ activity.startTime }}</LabeledText>
    <LabeledText label="page.activity.duration" :state="activityState">{{ activity.duration }}</LabeledText>
    <LabeledText label="page.activity.place" :state="activityState">{{ activity.place }}</LabeledText>
  </div>

  <div class="my-5">&nbsp;</div>

  <TitleWithBtnPlus :btn-visible="true">{{ $t('page.activity.title.instances') }}</TitleWithBtnPlus>

  <SimpleTable
      :state="instancesState" i18n
      :headers="['page.activity.date', 'page.activity.startTime', 'page.activity.duration', 'page.activity.type', 'page.activity.place', '']">
    <SimpleTableRow clickable v-for="i in instances">
      <SimpleTableCell>{{ i.date ? $d(i.date) : "" }}</SimpleTableCell>
      <SimpleTableCell>{{ i.startTime }}</SimpleTableCell>
      <SimpleTableCell>{{ i.duration }}</SimpleTableCell>
      <SimpleTableCell>{{ $t('data.' + i.ndsActivityType?.i18nName) }}</SimpleTableCell>
      <SimpleTableCell>{{ i.place }}</SimpleTableCell>
      <SimpleTableCell class="!py-0">
        <button class="rounded-full hover:bg-slate-100 active:bg-slate-200 h-8 w-8 flex items-center main-transition duration-75">
          <font-awesome-icon icon="fa-ellipsis-vertical" class="mx-auto" size="1x"/>
        </button>
      </SimpleTableCell>
    </SimpleTableRow>
  </SimpleTable>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import LabeledText from "../components/LabeledText.vue";
import {LoadingStates} from "../types/LoadingStates";
import SimpleTable from "../components/list/SimpleTable.vue";
import SimpleTableRow from "../components/list/SimpleTableRow.vue";
import SimpleTableCell from "../components/list/SimpleTableCell.vue";

export default defineComponent({
  name: "Activity",
  components: {SimpleTableCell, SimpleTableRow, SimpleTable, LabeledText, TitleWithBtnPlus},
  data() {
    return {
      activity: {} as Nds.Activity,
      activityState: LoadingStates.Loading as LoadingStates,
      instances: [{}] as Nds.ActivityInstance[],
      instancesState: LoadingStates.Loading as LoadingStates,
    }
  }
})
</script>

<style scoped>

</style>