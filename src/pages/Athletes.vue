<template>
  <TitleWithBtnPlus @click="setVisibility(true)">{{$t('page.athletes.title')}}</TitleWithBtnPlus>

  <UserList :state="athletesState" :users="athletes"/>

  <Modal ref="modal">
    <form class="grid sm:grid-cols-2 gap-4 with-label mt-4">
      <div>
        <label>{{$t('glob.user.firstName')}}</label>
        <input v-model="newAthlete.firstName" required>
      </div>

      <div>
        <label>{{$t('glob.user.lastName')}}</label>
        <input v-model="newAthlete.lastName" required>
      </div>

      <div>
        <label>{{$t('glob.user.birthdate')}}</label>
        <input type="date" v-model="newAthlete.birthDate" required>
      </div>

      <div>
        <label>{{$t('glob.user.gender')}}</label>
        <!-- todo: replace with data from server -->
        <select v-model="newAthlete.genderId" required>
          <option :value="1" selected>Unspecified</option>
          <option :value="2" selected>Female</option>
          <option :value="3" selected>Male</option>
          <option :value="4" selected>Diverse</option>
        </select>
      </div>

      <div>
        <label>{{$t('glob.user.prefLang')}}</label>
        <!-- todo: replace with data from server -->
        <select v-model="newAthlete.languageId" required>
          <option :value="1" selected>English</option>
          <option :value="2" selected>German</option>
          <option :value="3" selected>French</option>
        </select>
      </div>

      <div>
        <label>{{$t('glob.user.email')}}</label>
        <input v-model="newAthlete.primaryMail">
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <button type="button" v-on:click="createUser()" class="btn btn-block btn-primary">{{$t('glob.btn.create')}}</button>
        <button v-on:click="setVisibility(false)" class="btn btn-block">{{$t('glob.btn.cancel')}}</button>
      </div>

    </form>

  </Modal>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import axios from "axios";
import Const from "../plugins/Constants"
import Modal from "../components/modals/Modal.vue";
import User from "../types/User";
import moment from "moment/moment";
import {useAuthStore} from "../stores/auth";
import UserList from "../components/user/UserList.vue";
import {LoadingStates} from "../types/LoadingStates";
import {useToastStore} from "../stores/toast";
import TitleWithBtnPlus from "../components/title/TitleWithBtnPlus.vue";

export default defineComponent({
  components: {TitleWithBtnPlus, UserList, Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()

    return {authStore, toastStore}
  },
  data() {
    return {
      athletes: [] as User[],
      athletesState: NaN as LoadingStates,
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
      this.athletesState = LoadingStates.Loading
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
        this.athletesState = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.athletesState = LoadingStates.Error
      })
    },
    createUser() {
      this.newAthlete.birthDate = moment(this.newAthlete.birthDate).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS) + "Z"
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