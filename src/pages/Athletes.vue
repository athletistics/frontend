<template>
  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="setVisibility(true)">{{ $t('page.athletes.title') }}
  </TitleWithBtnPlus>
  <UserList :state="athletesState" :users="athletes"/>

  <div class="py-4"></div>

  <TitleWithBtnPlus :btn-visible="canManageUsers()" @btn-click="setExternalVisibility(true)">
    {{ $t('page.athletes.titleExternal') }}
  </TitleWithBtnPlus>
  <UserList :state="externalAthletesState" :users="externalAthletes"/>

  <Modal ref="modal" classes="xl:max-w-5xl sm:h-auto h-5/6">
    <h3>{{ $t('page.athletes.create') }}</h3>

    <form class="grid lg:grid-cols-3 sm:grid-cols-2 gap-4 with-label mt-4">
      <div>
        <label>{{ $t('glob.user.firstName') }}*</label>
        <input v-model="newAthlete.firstName" required>
      </div>

      <div>
        <label>{{ $t('glob.user.lastName') }}*</label>
        <input v-model="newAthlete.lastName" required>
      </div>

      <div>
        <label>{{ $t('glob.user.birthdate') }}*</label>
        <input type="date" v-model="newAthlete.birthDate" required>
      </div>

      <div>
        <label>{{ $t('glob.user.gender') }}*</label>
        <!-- todo: replace with data from server -->
        <select v-model="newAthlete.genderId" required>
          <option :value="1" selected>Unspecified</option>
          <option :value="2" selected>Female</option>
          <option :value="3" selected>Male</option>
          <option :value="4" selected>Diverse</option>
        </select>
      </div>

      <div>
        <label>{{ $t('glob.user.oasi') }}</label>
        <input v-model="newAthlete.oasi">
      </div>

      <div>
        <label>{{ $t('glob.user.nationality') }}*</label>
        <select v-model="newAthlete.nationalityId" required>
          <option v-for="d in dataStore.countries" :value="d.id">{{ d.name }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('glob.user.prefLang') }}*</label>
        <select v-model="newAthlete.languageId" required>
          <option v-for="l in dataStore.languages" :value="l.id">{{ l.short }}</option>
        </select>
      </div>

      <div>
        <label>{{ $t('glob.user.primaryMail') }}</label>
        <input v-model="newAthlete.primaryMail">
      </div>

      <div>
        <label>{{ $t('glob.user.primaryPhone') }}</label>
        <input v-model="newAthlete.primaryPhone">
      </div>

      <div class="flex">
        <Switch v-model="newAthlete.withLogin">{{ $t('glob.user.withLogin') }} {{ newAthlete.withLogin }}</Switch>
      </div>
    </form>

    <hr class="mt-4">

    <form class="grid lg:grid-cols-3 sm:grid-cols-2 gap-4 with-label mt-4">
      <div>
        <label>{{ $t('glob.user.address') }}</label>
        <input v-model="newAthlete.address">
      </div>

      <div>
        <label>{{ $t('glob.user.houseNumber') }}</label>
        <input v-model="newAthlete.address">
      </div>

      <div>
        <label>{{ $t('glob.user.postCode') }}*</label>
        <input v-model="newAthlete.postCode" required>
      </div>

      <div>
        <label>{{ $t('glob.user.city') }}*</label>
        <input v-model="newAthlete.city" required>
      </div>

      <div>
        <label>{{ $t('glob.user.country') }}*</label>
        <select v-model="newAthlete.countryId" required>
          <option v-for="c in dataStore.countries" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

    </form>

    <template #bottom>
      <hr>
      <div class="grid sm:grid-cols-2 gap-4">
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createUser()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </div>
    </template>

  </Modal>
  <UserRedeemShareCodeModal ref="externalModal" @created="loadAthletes"/>
</template>

<script lang="ts">
import axios from "axios";
import {defineComponent} from "vue";

import {useAuthStore} from "@/stores/auth";
import {useToastStore} from "@/stores/toast";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";

import User from "@/types/User";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import Const from "@/plugins/Constants"
import {canManageUsers} from "@/plugins/AccessControl";

import Modal from "@/components/dialogs/Modal.vue";
import Switch from "@/components/form/Switch.vue";
import UserList from "@/components/user/UserList.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import TitleWithBtnPlus from "@/components/title/TitleWithBtnPlus.vue";
import UserRedeemShareCodeModal from "@/components/user/UserRedeemShareCodeModal.vue";

export default defineComponent({
  components: {UserRedeemShareCodeModal, Switch, LoadingBtn, TitleWithBtnPlus, UserList, Modal},
  setup: function () {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const dataStore = useDataStore()
    const userStore = useMyUserStore()

    return {authStore, toastStore, dataStore, userStore}
  },
  data() {
    return {
      athletes: [] as User[],
      externalAthletes: [] as User[],
      athletesState: NaN as LoadingStates,
      externalAthletesState: NaN as LoadingStates,
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
    setExternalVisibility(visible: boolean) {
      (this.$refs.externalModal as any).setVisibility(visible)
    },
    loadAthletes() {
      this.athletesState = LoadingStates.Loading
      this.externalAthletesState = LoadingStates.Loading
      this.athletes = [] as User[]
      this.externalAthletes = [] as User[]

      axios.request({
        url: "/users?separated=true", method: 'get',
        baseURL: Const.API_URL,
        headers: {'Authorization': 'Bearer ' + this.authStore.token}
      }).then(response => {
        this.athletes = response.data.owned
        this.externalAthletes = response.data.shared

        this.athletesState = this.athletes?.length ? LoadingStates.Loaded : LoadingStates.Empty
        this.externalAthletesState = this.externalAthletes?.length ? LoadingStates.Loaded : LoadingStates.Empty
      }).catch(error => {
        this.toastStore.addToastFromAxiosError(error)
        this.athletesState = LoadingStates.Error
        this.externalAthletesState = LoadingStates.Error
      })
    },
    createUser() {
      this.newAthlete.clubId = this.userStore.user.clubId
      this.createState.state = LoadingStates.Loading
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