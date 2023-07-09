import {acceptHMRUpdate, defineStore} from 'pinia'
import Discipline from "../types/Discipline";
import axios from "axios";
import Const from "../plugins/Constants";
import {useAuthStore} from "./auth";
import User from "../types/User";
import Category from "../types/Category";
import Event from "../types/Event";
import EventType from "../types/EventType";
import Language from "../types/Language";
import LoadingState from "../types/LoadingState";
import {LoadingStates} from "../types/LoadingStates";
import Indexable from "../types/Indexable";
import Country from "../types/Country";
import {Nds} from "../types/Nds";

interface State {
  externalIdTypes: ExternalId.Type[]
  activityTypes: Nds.ActivityType[]
  eventTypes: EventType[]
  disciplines: Discipline[]
  categories: Category[]
  countries: Country[]
  staticResults: Result.Static[]
  staticResultTypes: Result.StaticType[],
  languages: Language[],
  events: Event[],
  users: User[]
  maps: StateMaps
}

interface StateMaps {
  events: Map<string, Event>,
  categories: Map<string, Category>,
  disciplines: Map<string, Discipline>
}

export const useDataStore = defineStore('data', {
  state: (): State => ({
    externalIdTypes: [] as ExternalId.Type[],
    activityTypes: [] as Nds.ActivityType[],
    eventTypes: [] as EventType[],
    disciplines: [] as Discipline[],
    categories: [] as Category[],
    countries: [] as Country[],
    staticResults: [] as Result.Static[],
    staticResultTypes: [] as Result.StaticType[],
    languages: [] as Language[],
    events: [] as Event[],
    users: [] as User[],
    maps: {
      events: new Map<string, Event>(),
      categories: new Map<string, Category>(),
      disciplines: new Map<string, Discipline>()
    }
  }),
  getters: {
    getExternalIdTypeById(state) {
      return (id: number): EventType | undefined => {
        return state.externalIdTypes.find(e => e.id === id)
      }
    },
    getActivityById(state) {
      return (id: number): EventType | undefined => {
        return state.activityTypes.find(e => e.id === id)
      }
    },
    getEventTypeById(state) {
      return (id: number): EventType | undefined => {
        return state.eventTypes.find(e => e.id === id)
      }
    },
    getEventById(state) {
      return (id: string): Event | undefined => {
        if (!state.maps.events?.size) return undefined
        return state.maps.events.get(id)
      }
    },
    getDisciplineById(state) {
      return (id: string): Discipline | undefined => {
        if (!state.maps.disciplines?.size) return undefined

        return state.maps.disciplines.get(id)
      }
    },
    getCategoryById(state) {
      return (id: string): Category | undefined => {
        if (!state.maps.categories?.size) return {id, name: "", gender: ""}

        return state.maps.categories.get(id)
      }
    },
    getReferenceValue(state) {
      return (disciplineId: string, categoryId: string, typeId: number): Result.Static | undefined => {
        for (let i = 0; i < state.staticResults.length; i++) {
          const r = state.staticResults[i]

          if (r.categoryId == categoryId && r.disciplineId == disciplineId && r.resultStaticTypeId === typeId) {
            return r
          }
        }

        return undefined
      }
    },
    getStaticTypeById(state) {
      return (id: number): Result.StaticType => {
        for (let i = 0; i < state.staticResultTypes.length; i++) {
          if (state.staticResultTypes[i].id === id) return state.staticResultTypes[i]
        }
        return {id: 0, i18nType: ""}
      }
    },
    getLanguageById(state) {
      return (id: number): Language | undefined => {
        for (let i = 0; i < state.languages.length; i++) {
          if (state.languages[i].id === id) return state.languages[i]
        }
        return undefined
      }
    }
  },
  actions: {
    updateAll() {
      this.updateUsers()
      this.updateEvents()
      this.updateLanguages()
      this.updateEventTypes()
      this.updateCountries()
      this.updateCategories()
      this.updateDisciplines()
      this.updateActivityTypes()
      this.updateStaticResults()
      this.updateExternalIdTypes()
    },
    updateExternalIdTypes(s?: LoadingState) {
      this.updateData<ExternalId.Type>('/externalId/idTypes', 'externalIdTypes', undefined, s)
    },
    updateActivityTypes(s?: LoadingState) {
      this.updateData<Nds.ActivityType>('/nds/types', 'activityTypes', undefined, s)
    },
    updateDisciplines(s?: LoadingState) {
      this.updateData<Discipline>('/disciplines', 'disciplines', 'disciplines', s)
    },
    updateEvents(s?: LoadingState) {
      this.updateData<Event>('/events', 'events', 'events', s)
    },
    updateUsers(s?: LoadingState) {
      this.updateData<User>('/users', 'users', undefined, s, true)
    },
    updateCategories(s?: LoadingState) {
      this.updateData<Category>('/data/categories?sport=1', 'categories', 'categories', s)
    },
    updateCountries(s?: LoadingState){
      this.updateData<Country>('/data/countries', 'countries', undefined, s)
    },
    updateStaticResults(s?: LoadingState) {
      this.updateData('/results/static?sport=1', undefined, undefined, s)?.then(response => {
        this.staticResults = response.data.results
        this.staticResultTypes = response.data.types
      })
    },
    updateEventTypes(s?: LoadingState) {
      this.updateData<EventType>('/data/eventTypes?filter=false', 'eventTypes', undefined, s)
    },
    updateLanguages(s?: LoadingState) {
      this.updateData<Language>('/data/languages', 'languages', undefined, s)
    },
    updateData<dataType extends Indexable>(url: string, targetProperty?: keyof State, targetMapProperty?: keyof StateMaps, stateObj?: LoadingState, requires2fa: boolean = false) {
      const authStore = useAuthStore()
      if (!authStore.token) return
      if (requires2fa && !authStore.is2FaOk) return;

      // set the state to loading
      if (stateObj) stateObj.state = LoadingStates.Loading

      // create a request, and store the response promise
      const req = axios.request({
        url,
        method: 'get',
        baseURL: Const.API_URL,
        headers: {
          'Authorization': 'Bearer ' + authStore.token
        },
      })

      // process the response success and error
      req.then(response => {
        // set the state to loaded or empty, based on the number of returned results
        if (stateObj) stateObj.state = response.data?.length ? LoadingStates.Loaded : LoadingStates.Empty

        // don't store data in this callback function, of no targetProperty is set
        if (!targetProperty) return;

        // store the data as an array
        this[targetProperty] = response.data

        if (targetMapProperty) {
          (this.maps[targetMapProperty] as unknown as Map<string | number, dataType>) = new Map<string | number, dataType>();
          (this[targetProperty] as dataType[]).forEach(v => {
            (this.maps[targetMapProperty] as unknown as Map<string | number, dataType>).set(v.id, v)
          })
        }
      }).catch(() => {
        if(stateObj) stateObj.state = LoadingStates.Error
        console.log('error reading path ' + url)
      })

      // return the response promise, allowing the caller to add additional callbacks
      return req
    }
  },
  persist: true
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}