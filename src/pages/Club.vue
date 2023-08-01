<template>
  <div v-if="club?.sport" class="flex items-baseline">
    <h1 class="mr-2">{{ club.name }}</h1>
    <h4>{{ $t('data.' + club.sport.i18nName) }}</h4>
  </div>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus @btn-click="($refs.modal as any).setVisibility(true)" :btn-visible="canManageTeam()">
    {{ $t('page.club.title.teams') }}
  </TitleWithBtnPlus>

  <SimpleList :state="teamsState">
    <SimpleListEntry v-for="t in teams" :to="'/team/'+t.id">{{ t.name }}</SimpleListEntry>
  </SimpleList>

  <div class="py-5">&nbsp;</div>

  <TitleWithBtnPlus @btn-click="setDisciplinePopupVisibility(true)" :btn-visible="canManageDiscipline()">{{
      $t('page.club.title.disciplines')
    }}
  </TitleWithBtnPlus>

  <SimpleList :state="disciplineStateObj.state">
    <SimpleListEntry v-for="d in dataStore.disciplines.filter(d => !d.isOfficial)">{{ d.customName }}
    </SimpleListEntry>
  </SimpleList>

  <DialogTeamCreate ref="modal" @success="loadTeams"/>

  <Modal ref="modalDiscipline">
    <form class="space-y-4 with-label">
      <h3>{{ $t('page.club.title.createDiscipline') }}</h3>
      <hr>
      <div>
        <label>{{ $t('page.club.disciplineName') }}</label>
        <input v-model="newDiscipline.customName">
      </div>

      <div>
        <label>{{ $t('page.club.disciplineType') }}</label>
        <select v-model="newDiscipline.isDescending" required>
          <option :value="true" selected>{{ $t('page.club.disciplineTypeAsc') }}</option>
          <option :value="false" selected>{{ $t('page.club.disciplineTypeDesc') }}</option>
        </select>
      </div>
      <hr>
      <div class="grid md:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createDiscipline()">
          {{ $t('glob.btn.save') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setDisciplinePopupVisibility(false)">
          {{ $t('glob.btn.cancel') }}
        </LoadingBtn>
      </div>
    </form>
  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";

import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";
import {useToastStore} from "@/stores/toast";

import Club from "@/types/Club";
import Team from "@/types/Team";
import Discipline from "@/types/Discipline";
import LoadingState from "@/types/LoadingState";
import Const from "@/plugins/Constants"
import {LoadingStates} from "@/types/LoadingStates";
import {canManageDiscipline, canManageTeam} from "@/plugins/AccessControl";

import Modal from "@/components/dialogs/Modal.vue";
import BtnPlus from "@/components/button/BtnPlus.vue";
import SimpleList from "@/components/list/SimpleList.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import SimpleListEntry from "@/components/list/SimpleListEntry.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import DialogTeamCreate from "@/components/dialogs/DialogTeamCreate.vue";

export default defineComponent({
  components: {DialogTeamCreate, LoadingBtn, SimpleList, SimpleListEntry, TitleWithBtnPlus, BtnPlus, Modal},
  setup() {
    const authStore = useAuthStore()
    const userStore = useMyUserStore()
    const dataStore = useDataStore()
    const toastStore = useToastStore()

    return {authStore, userStore, dataStore, toastStore}
  },
  data() {
    return {
      club: {} as Club,
      teams: [] as Team[],
      teamsState: NaN as LoadingStates,
      disciplineStateObj: {state: NaN} as LoadingState,
      newDiscipline: {} as Discipline,
      createState: {state: NaN} as LoadingState
    }
  },
  mounted() {
    axios.request({
      url: "/club/" + this.userStore.user.clubId,
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.club = response.data
    })

    this.loadTeams()
  },
  methods: {
    canManageDiscipline, canManageTeam,
    setDisciplinePopupVisibility(visible: boolean) {
      (this.$refs.modalDiscipline as any).setVisibility(visible)

      if (!visible) this.newDiscipline = {} as Discipline
    },
    createDiscipline() {
      this.createState.state = LoadingStates.Loading
      axios.request({
        url: "/disciplines",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newDiscipline
      }).then(() => {
        this.createState.state = LoadingStates.Loaded

        this.dataStore.updateDisciplines(this.disciplineStateObj)
        this.setDisciplinePopupVisibility(false)
        this.toastStore.addSuccessToast()
      }).catch(error => {
        this.createState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
      })
    },
    loadTeams() {
      this.teamsState = LoadingStates.Loading
      axios.request({
        url: "/club/" + this.userStore.user.clubId + "/teams",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.teamsState = response.data.length ? LoadingStates.Loaded : LoadingStates.Empty
        this.teams = response.data
      }).catch(() => {
        this.teamsState = LoadingStates.Error
      })
    }
  }
})
</script>

<style scoped>

</style>