<template>
  <h1>Athletes</h1>
  <button class="bg-primary text-white" v-on:click="setVisibility(true)">+</button>

  <hr>

  <p v-for="a in athletes">{{ a.lastName }} {{ a.firstName }}</p>

  <Modal ref="modal">
    <form class="grid sm:grid-cols-2 gap-4 with-label mt-4">
      <div>
        <label>Frst name</label>
        <input v-model="newAthlete.firstName" required>
      </div>

      <div>
        <label>Last name</label>
        <input v-model="newAthlete.lastName" required>
      </div>

      <div>
        <label>Birthdate</label>
        <input type="date" v-model="newAthlete.birthdate" required>
      </div>

      <div>
        <label>Gender</label>
        <!-- todo: replace with data from server -->
        <select v-model="newAthlete.genderId" required>
          <option :value="1" selected>Unspecified</option>
          <option :value="2" selected>Female</option>
          <option :value="3" selected>Male</option>
          <option :value="4" selected>Diverse</option>
        </select>
      </div>

      <div>
        <label>Preferred Language</label>
        <!-- todo: replace with data from server -->
        <select v-model="newAthlete.languageId" required>
          <option :value="1" selected>English</option>
          <option :value="2" selected>German</option>
          <option :value="3" selected>French</option>
        </select>
      </div>

      <div>
        <label>E-Mail</label>
        <input v-model="newAthlete.primaryMail">
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <button type="button" v-on:click="createUser()" class="btn btn-block btn-primary">Create</button>
        <button v-on:click="setVisibility(false)" class="btn btn-block">Cancel</button>
      </div>

    </form>

  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants.ts"
import Modal from "../components/Modal.vue";
import User from "../types/User.ts";
import moment from "moment";
import {useAuthStore} from "../stores/auth.ts";

export default defineComponent({
  components: {Modal},
  setup() {
    const authStore = useAuthStore()

    return {authStore}
  },
  data() {
    return {
      athletes: [] as User[],
      newAthlete: {} as User,
    }
  },
  mounted() {
    this.loadAthletes()
  },
  methods: {
    setVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)

      if (!visible) this.newAthlete = {} as User
    },
    loadAthletes() {
      axios.request({
        url: "/users",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newAthlete
      }).then(response => {
        this.athletes = response.data
      })
    },
    createUser() {
      this.newAthlete.birthdate = moment(this.newAthlete.birthdate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS) + "Z"
      this.newAthlete.placeId = 1
      this.newAthlete.nationalityId = 1
      axios.request({
        url: "/users",
        method: 'post',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        },
        data: this.newAthlete
      }).then(() => {
        this.loadAthletes()
        this.setVisibility(false)
      })
    },
  }
})
</script>

<style scoped>

</style>