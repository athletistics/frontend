<template>
  <h1>{{ team.name }}</h1>
  <button v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">Add participants</button>
  <hr>

  <div v-for="p in participants">
    <input :id="p.id" :value="p.id" type="checkbox" v-model="usersToRemove">
    <label :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
  </div>
  <hr>
  <button type="button" v-on:click="removeFromTeam()" class="btn btn-block btn-error">Remove selected Users from team</button>

  <Modal ref="modal">
    <h3>Create team</h3>
    <hr>
      <div v-for="u in filteredUsers"  class="inline-flex">
        <input :id="u.id" :value="u.id" type="checkbox" v-model="usersToAdd">
        <label :for="u.id">{{u.lastName}} {{u.firstName}}</label>
      </div>
    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <button type="button" v-on:click="addToTeam()" class="btn btn-block btn-primary">Add</button>
      <button type="button" v-on:click="setModalVisibility(false)" class="btn btn-block">Cancel</button>
    </div>
  </Modal>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import Team from "../types/Team.ts";
import axios from "axios";
import Const from "../plugins/Constants.ts"
import User from "../types/User.ts";
import {useAuthStore} from "../stores/auth.ts";
import Modal from "../components/Modal.vue";
import {useToastStore} from "../stores/toast.ts";
import Toast from "../components/Toast.vue";

export default defineComponent({
  components: {Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    return {authStore, toastStore}
  },
  data() {
    return {
      team: {} as Team,
      users: [] as User[],
      participants: [] as User[],
      usersToAdd: [] as string[],
      usersToRemove: [] as string[]
    }
  },
  computed: {
    filteredUsers() {
      const users = []
      for (let i = 0; i < this.users.length; i++) {
        if (this.participants.some(p => p.id === this.users[i].id)) continue
        users.push(this.users[i])
      }
      return users
    }
  },
  methods: {
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    addToTeam() {
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.usersToAdd
      }).then(() => {
        this.getParticipants()
        this.usersToAdd = []
        this.toastStore.addToast({title:"Success", color: "bg-primary"})
      }).catch(error => {
        this.toastStore.addToast({
          title: "Unable to fulfill request",
          code: error.response.data.error,
          message: error.response.data.message,
          color: "bg-error",
        })
        console.log('error adding participants')
      })
    },
    removeFromTeam(){
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'delete',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.usersToRemove
      }).then(() => {
        this.getParticipants()
        this.usersToRemove = []
      }).catch(() => console.log('error adding participants'))
    },
    getAthletes() {
      axios.request({
        url: "/users",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.users = response.data
      })
    },
    getParticipants() {
      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.participants = response.data
      })
    }
  },
  mounted() {
    axios.request({
      url: "/teams/" + this.$route.params.id,
      method: 'get',
      baseURL: Const.API_URL,
      headers: {
        'Authorization': 'Bearer ' + this.authStore.token
      }
    }).then(response => {
      this.team = response.data
    })

    this.getAthletes()
    this.getParticipants()
  }
})
</script>

<style scoped>

</style>