<template>
  <h1>{{ team.name }}</h1>


  <div class="grid md:grid-cols-2 gap-4" v-if="canManageTeam() && !editMode">
    <button type="button" v-on:click="setModalVisibility(true)" class="btn btn-block btn-primary">{{
        $t('page.team.addPart')
      }}
    </button>
    <button type="button" @click="setSelectable(true)" class="btn btn-block btn-error">
      {{ $t('page.team.selectForRemoval') }}
    </button>
  </div>

  <div class="grid md:grid-cols-2 gap-4" v-if="canManageTeam() && editMode">
    <button type="button" v-on:click="removeFromTeam()" class="btn btn-block btn-error">{{
        $t('page.team.removePart')
      }}
    </button>
    <button type="button" @click="setSelectable(false)" class="btn btn-block">
      {{ $t('glob.btn.cancel') }}
    </button>
  </div>


  <SimpleList :state="state">
    <SimpleListEntry v-for="p in participants" :to="'/athletes/' + p.id" :enabled="!editMode">
      <input v-if="editMode" class="mr-2" :id="p.id" :value="p.id" type="checkbox" v-model="usersToRemove">
      <label class="w-full" :for="p.id">{{ p.lastName }} {{ p.firstName }}</label>
    </SimpleListEntry>
  </SimpleList>

  <Modal ref="modal">
    <h3>{{ $t('page.team.addPartTitle') }}</h3>
    <hr>
    <div v-for="u in filteredUsers" class="flex hover:bg-main cursor-pointer">
      <input class="mr-2 cursor-pointer" :id="u.id" :value="u.id" type="checkbox" v-model="usersToAdd">
      <label class="flex-grow py-3 cursor-pointer" :for="u.id">{{ u.lastName }} {{ u.firstName }}</label>
    </div>
    <hr>
    <div class="grid sm:grid-cols-2 gap-4">
      <button type="button" v-on:click="addToTeam()" class="btn btn-block btn-primary">{{ $t('glob.btn.add') }}</button>
      <button type="button" v-on:click="setModalVisibility(false)" class="btn btn-block">{{ $t('glob.btn.cancel') }}
      </button>
    </div>
  </Modal>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import Team from "../types/Team";
import axios from "axios";
import Const from "../plugins/Constants"
import User from "../types/User";
import {useAuthStore} from "../stores/auth";
import Modal from "../components/modals/Modal.vue";
import {useToastStore} from "../stores/toast";
import SimpleList from "../components/list/SimpleList.vue";
import SimpleListEntry from "../components/list/SimpleListEntry.vue";
import {LoadingStates} from "../types/LoadingStates";
import {canManageTeam} from "../plugins/AccessControl";

export default defineComponent({
  components: {SimpleListEntry, Modal, SimpleList},
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
      state: NaN as LoadingStates,
      editMode: false as boolean,
      usersToAdd: [] as string[],
      usersToRemove: [] as string[]
    }
  },
  computed: {
    filteredUsers(): User[] {
      const users = []
      for (let i = 0; i < this.users.length; i++) {
        if (this.participants.some(p => p.id === this.users[i].id)) continue
        users.push(this.users[i])
      }
      return users
    }
  },
  methods: {
    canManageTeam,
    setModalVisibility(visible: boolean) {
      (this.$refs.modal as any).setVisibility(visible)
    },
    setSelectable(selectable: boolean){
      this.editMode = selectable
      this.usersToRemove = []
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
        this.toastStore.addToast({title: "Success", color: "bg-primary"})
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
    removeFromTeam() {
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
      this.state = LoadingStates.Loading

      axios.request({
        url: "/teams/" + this.$route.params.id + "/participants",
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + this.authStore.token
        }
      }).then(response => {
        this.state = response.data.length ? LoadingStates.Loaded : LoadingStates.Empty
        this.participants = response.data
      }).catch(() => {
        this.state = LoadingStates.Error
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