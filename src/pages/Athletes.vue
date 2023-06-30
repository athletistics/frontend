<template>
  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="setVisibility(true)">{{$t('page.athletes.title')}}</TitleWithBtnPlus>

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
        <select v-model="newAthlete.languageId" required>
          <option v-for="l in dataStore.languages" :value="l.id">{{l.short}}</option>
        </select>
      </div>

      <div>
        <label>{{$t('glob.user.email')}}</label>
        <input v-model="newAthlete.primaryMail">
      </div>

    </form>

    <div class="grid sm:grid-cols-2 gap-4">
      <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createUser()">{{$t('glob.btn.create')}}</LoadingBtn>
      <LoadingBtn full outlined @click="setVisibility(false)">{{$t('glob.btn.cancel')}}</LoadingBtn>
    </div>

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
import {useDataStore} from "../stores/data";
import {canManageUsers} from "../plugins/AccessControl";
import LoadingBtn from "../components/button/LoadingBtn.vue";
import LoadingState from "../types/LoadingState";

export default defineComponent({
  components: {LoadingBtn, TitleWithBtnPlus, UserList, Modal},
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()

    return {authStore, toastStore, dataStore}
  },
  data() {
    return {
      athletes: [] as User[],
      athletesState: NaN as LoadingStates,
      newAthlete: {} as User,
      createState: {state: NaN} as LoadingState
    }
  },
  mounted() {
    this.loadAthletes()
  },
  methods: {
    canManageUsers,
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
        }
      }).then(response => {
        this.athletes = response.data
        this.athletesState = response.data ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.athletesState = LoadingStates.Error
      })
    },
    createUser() {
      this.createState.state = LoadingStates.Loading
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
        this.createState.state = LoadingStates.Loaded
        this.loadAthletes()
        this.setVisibility(false)
      }).catch((error) => {
        this.createState.state = LoadingStates.Error
        this.toastStore.addToastFromAxiosError(error)
      })
    },
  }
})
</script>

<style scoped>

</style>