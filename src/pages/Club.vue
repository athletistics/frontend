<template>
  <h1>Club</h1>
  <p>{{ club }}</p>

  <hr>
  <h1>Teams</h1>
  <button class="bg-primary text-white" v-on:click="setTeamPopupVisibility(true)">+</button>
  <p v-for="t in teams"><router-link :to="'/team/' + t.id">{{ t.name }}</router-link></p>

  <Modal ref="modal">
    <h3>Create team</h3>
    <hr>
    <div>
      <label>Team name</label>
      <input v-model="newTeam.name">
    </div>
    <hr>
    <div>
      <button class="btn btn-primary btn-block !mt-0" @click="createTeam()" type="button">Speichern</button>
      <button class="btn btn-block" @click="setTeamPopupVisibility(false)" type="button">Abbrechen</button>
    </div>
  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Club from "../types/Club.ts";
import Team from "../types/Team.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts"
import {mapGetters} from "vuex";
import Modal from "../components/Modal.vue";

export default defineComponent({
  components: {Modal},
  data() {
    return {
      club: {} as Club,
      teams: [] as Team[],
      newTeam: {} as Team
    }
  },
  mounted() {
    axios.request({
      url: "/club/" + this.user.clubId,
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.token
      }
    }).then(response => {
      this.club = response.data
    })

    this.loadTeams()
  },
  methods: {
    setTeamPopupVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)

      if (!visible) this.newTeam = {} as Team
    },
    createTeam() {
      axios.request({
        url: "/club/" + this.user.clubId + "/teams",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.token
        },
        data: this.newTeam
      }).then(response => {
        this.loadTeams()
        this.setTeamPopupVisibility(false)
      })
    },
    loadTeams() {
      axios.request({
        url: "/club/" + this.user.clubId + "/teams",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.token
        }
      }).then(response => {
        this.teams = response.data
      })
    }
  },
  computed: {
    ...mapGetters({
      token: "getToken",
      user: "getUser"
    })
  }
})
</script>

<style scoped>

</style>