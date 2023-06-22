<template>
  <h1>Club</h1>
  <p>{{ club }}</p>

  <hr>
  <h1>Teams</h1>
  <button class="btn btn-primary" v-on:click="setTeamPopupVisibility(true)">+</button>
  <p v-for="t in teams">
    <router-link :to="'/team/' + t.id">{{ t.name }}</router-link>
  </p>

  <hr>
  <h1>Disciplines</h1>
  <button class="btn btn-primary" v-on:click="setDisciplinePopupVisibility(true)">+</button>
  <p v-for="d in dataStore.disciplines">
    {{d.i18nName ?? d.customName}} <span v-if="!d.isOfficial">(custom)</span>
  </p>

  <Modal ref="modal">
    <h3>Create team</h3>
    <hr>
    <div>
      <label>Team name</label>
      <input v-model="newTeam.name">
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createTeam()" type="button">Save</button>
      <button class="btn btn-block" @click="setTeamPopupVisibility(false)" type="button">Cancel</button>
    </div>
  </Modal>

  <Modal ref="modalDiscipline">
    <h3>Create custom discipline</h3>
    <hr>
    <div>
      <label>Discipline name</label>
      <input v-model="newDiscipline.customName">
    </div>

    <div>
      <label>Type</label>
      <select v-model="newDiscipline.isDescending" required>
        <option :value="true" selected>Higher is better (meters)</option>
        <option :value="false" selected>Lower is better (seconds)</option>
      </select>
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createDiscipline()" type="button">Save</button>
      <button class="btn btn-block" @click="setDisciplinePopupVisibility(false)" type="button">Cancel</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Club from "../types/Club.ts";
import Team from "../types/Team.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts"
import Modal from "../components/modals/Modal.vue";
import {useAuthStore} from "../stores/auth.ts";
import {useMyUserStore} from "../stores/user.ts";
import {useDataStore} from "../stores/data.ts";
import Discipline from "../types/Discipline.ts";
import {useToastStore} from "../stores/toast.ts";

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