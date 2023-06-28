<template>
  <div v-if="club?.sport" class="flex items-baseline">
    <h1 class="mr-2">{{ club.name }}</h1>
    <h4>{{ $t('data.sport.' + club.sport.i18nName) }}</h4>
  </div>

  <div class="my-5">&nbsp;</div>

  <TitleWithBtnPlus @click="setTeamPopupVisibility(true)">{{ $t('page.club.title.teams') }}</TitleWithBtnPlus>

  <SimpleList :state="teamsState">
    <SimpleListEntry v-for="t in teams" :to="'/team/'+t.id">{{ t.name }}</SimpleListEntry>
  </SimpleList>

  <div class="my-5">&nbsp;</div>

  <TitleWithBtnPlus @click="setDisciplinePopupVisibility(true)">{{
      $t('page.club.title.disciplines')
    }}
  </TitleWithBtnPlus>

  <SimpleList>
    <SimpleListEntry v-for="d in dataStore.disciplines">{{ d.i18nName ?? d.customName }} <span v-if="!d.isOfficial">(custom)</span></SimpleListEntry>
  </SimpleList>

  <Modal ref="modal">
    <h3>{{ $t('page.club.title.createTeam') }}</h3>
    <hr>
    <div>
      <label>{{ $t('page.club.teamName') }}</label>
      <input v-model="newTeam.name">
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createTeam()" type="button">{{ $t('glob.btn.save') }}
      </button>
      <button class="btn btn-block" @click="setTeamPopupVisibility(false)" type="button">{{ $t('glob.btn.cancel') }}
      </button>
    </div>
  </Modal>

  <Modal ref="modalDiscipline">
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
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createDiscipline()" type="button">
        {{ $t('glob.btn.save') }}
      </button>
      <button class="btn btn-block" @click="setDisciplinePopupVisibility(false)" type="button">
        {{ $t('glob.btn.cancel') }}
      </button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Club from "../types/Club";
import Team from "../types/Team";
import axios from "axios";
import Const from "../plugins/Constants"
import Modal from "../components/modals/Modal.vue";
import {useAuthStore} from "../stores/auth";
import {useMyUserStore} from "../stores/user";
import {useDataStore} from "../stores/data";
import Discipline from "../types/Discipline";
import {useToastStore} from "../stores/toast";
import BtnPlus from "../components/button/BtnPlus.vue";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";
import SimpleListEntry from "../components/list/SimpleListEntry.vue";
import SimpleList from "../components/list/SimpleList.vue";
import {LoadingStates} from "../types/LoadingStates";

export default defineComponent({
  components: {SimpleList, SimpleListEntry, TitleWithBtnPlus, BtnPlus, Modal},
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
      newTeam: {} as Team,
      newDiscipline: {} as Discipline
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

    this.dataStore.updateDisciplines()
    this.loadTeams()
  },
  methods: {
    setTeamPopupVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)

      if (!visible) this.newTeam = {} as Team
    },
    setDisciplinePopupVisibility(visible: boolean) {
      (this.$refs.modalDiscipline as any).setVisibility(visible)

      if (!visible) this.newDiscipline = {} as Discipline
    },
    createDiscipline() {
      axios.request({
        url: "/disciplines",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newDiscipline
      }).then(() => {
        this.dataStore.updateDisciplines()
        this.setDisciplinePopupVisibility(false)
        this.toastStore.addSuccessToast()
      }).catch(error => this.toastStore.addToastFromAxiosError(error))
    },
    createTeam() {
      axios.request({
        url: "/club/" + this.userStore.user.clubId + "/teams",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newTeam
      }).then(() => {
        this.loadTeams()
        this.setTeamPopupVisibility(false)
      }).catch(error => this.toastStore.addToastFromAxiosError(error))
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