<template>
  <h1>{{$t('page.club.title.club')}}</h1>
  <p>{{ club }}</p>

  <hr>

  <h1>{{$t('page.club.title.teams')}}</h1>
  <button class="btn btn-primary" v-on:click="setTeamPopupVisibility(true)">+</button>
  <p v-for="t in teams">
    <router-link :to="'/team/' + t.id">{{ t.name }}</router-link>
  </p>

  <hr>
  <h1>{{$t('page.club.title.disciplines')}}</h1>
  <button class="btn btn-primary" v-on:click="setDisciplinePopupVisibility(true)">+</button>
  <p v-for="d in dataStore.disciplines">
    {{d.i18nName ?? d.customName}} <span v-if="!d.isOfficial">(custom)</span>
  </p>

  <Modal ref="modal">
    <h3>{{$t('page.club.title.createTeam')}}</h3>
    <hr>
    <div>
      <label>{{$t('page.club.teamName')}}</label>
      <input v-model="newTeam.name">
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createTeam()" type="button">{{$t('glob.btn.save')}}</button>
      <button class="btn btn-block" @click="setTeamPopupVisibility(false)" type="button">{{$t('glob.btn.cancel')}}</button>
    </div>
  </Modal>

  <Modal ref="modalDiscipline">
    <h3>{{$t('page.club.title.createDiscipline')}}</h3>
    <hr>
    <div>
      <label>{{$t('page.club.disciplineName')}}</label>
      <input v-model="newDiscipline.customName">
    </div>

    <div>
      <label>{{$t('page.club.disciplineType')}}</label>
      <select v-model="newDiscipline.isDescending" required>
        <option :value="true" selected>{{$t('page.club.disciplineTypeAsc')}}</option>
        <option :value="false" selected>{{$t('page.club.disciplineTypeDesc')}}</option>
      </select>
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createDiscipline()" type="button">{{$t('glob.btn.save')}}</button>
      <button class="btn btn-block" @click="setDisciplinePopupVisibility(false)" type="button">{{$t('glob.btn.cancel')}}</button>
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

export default defineComponent({
  components: {Modal},
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
      axios.request({
        url: "/club/" + this.userStore.user.clubId + "/teams",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.teams = response.data
      })
    }
  }
})
</script>

<style scoped>

</style>