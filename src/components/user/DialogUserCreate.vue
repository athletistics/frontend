<template>
  <Dialog v-model:visible="visible" modal class="xl:max-w-5xl sm:max-w-none">
    <form ref="userCreateForm">

      <div class="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-8 gap-x-4">

        <span class="p-float-label p-fluid">
          <InputText
              id="firstName" v-model="newUser.firstName" v-tooltip="errors.firstName"
              :class="{'p-invalid': errors.firstName}"/>
          <label for="firstName">{{ $t('glob.user.firstName') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText
              id="lastName" v-model="newUser.lastName" v-tooltip="errors.lastName"
              :class="{'p-invalid': errors.lastName}"/>
          <label for="lastName">{{ $t('glob.user.lastName') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Calendar
              id="birthDate" v-model="newUser.birthDateObj" :class="{'p-invalid': errors.birthDate}"
              :max-date="new Date()" :show-on-focus="false" show-icon/>
          <label for="birthDate">{{ $t('glob.user.birthdate') }}*</label>
          <pre>{{ errors.birthDate }}</pre>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown
              id="genderId" v-model="newUser.genderId" input-id="id" :class="{'p-invalid': errors.genderId}"
              :options="genderOptions" option-label="name" option-value="id"/>
          <label for="genderId">{{ $t('glob.user.gender') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputMask
              id="oasi" v-model="newUser.oasi" v-tooltip="errors.oasi" :class="{'p-invalid': errors.oasi}"
              mask="999.9999.9999.99" placeholder="756.1234.5678.90"/>
          <label for="oasi">{{ $t('glob.user.oasi') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown
              id="nationalityId" v-model="newUser.nationalityId" :class="{'p-invalid': errors.nationalityId}"
              :options="dataStore.countries" option-label="name" option-value="id"/>
          <label for="nationalityId">{{ $t('glob.user.nationality') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown
              id="languageId" v-model="newUser.languageId" :class="{'p-invalid': errors.languageId}"
              :options="dataStore.languages" option-label="short" option-value="id"/>
          <label for="languageId">{{ $t('glob.user.prefLang') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText
              id="primaryMail" v-model="newUser.primaryMail" v-tooltip="errors.primaryMail"
              :class="{'p-invalid': errors.primaryMail}" :disabled="isEdit"/>
          <label for="primaryMail">{{ $t('glob.user.primaryMail') }}{{ withLogin ? '*' : '' }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText
              id="primaryPhone" v-model="newUser.primaryPhone" v-tooltip="errors.primaryPhone"
              :class="{'p-invalid': errors.primaryPhone}"/>
          <label for="primaryPhone">{{ $t('glob.user.primaryPhone') }}</label>
        </span>

        <span v-if="!isEdit" class="p-fluid flex items-center">
          <InputSwitch id="withLogin" v-model="withLogin"/>
          <label for="withLogin" class="ml-2">{{ $t('glob.user.withLogin') }}</label>
        </span>

      </div>

      <hr class="my-8">

      <div class="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-8 gap-x-4">
        <span class="p-float-label p-fluid">
          <InputText
              id="address" v-model="newUser.address" v-tooltip="errors.address"
              :class="{'p-invalid': errors.address}"/>
          <label for="address">{{ $t('glob.user.address') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText
              id="houseNumber" v-model="newUser.houseNumber" v-tooltip="errors.houseNumber"
              :class="{'p-invalid': errors.houseNumber}"/>
          <label for="houseNumber">{{ $t('glob.user.houseNumber') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText
              id="postCode" v-model="newUser.postCode" v-tooltip="errors.postCode"
              :class="{'p-invalid': errors.postCode}"/>
          <label for="postCode">{{ $t('glob.user.postCode') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="city" v-model="newUser.city" v-tooltip="errors.city" :class="{'p-invalid': errors.city}"/>
          <label for="city">{{ $t('glob.user.city') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <Dropdown
              id="countryId" v-model="newUser.countryId" :class="{'p-invalid': errors.countryId}"
              :options="dataStore.countries" option-label="name" option-value="id"/>
          <label for="countryId">{{ $t('glob.user.country') }}</label>
        </span>
      </div>

    </form>

    <template #header>
      <DialogTitle v-if="isEdit">{{ $t('page.athletes.modify') }}</DialogTitle>
      <DialogTitle v-else>{{ $t('page.athletes.create') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createUser()">
          {{ isEdit ? $t('glob.btn.save') : $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>


<script setup lang="ts">
import {toTypedSchema} from "@vee-validate/yup";
import axios, {AxiosError} from "axios";
import moment from "moment/moment";
import Dialog from "primevue/dialog";
import {useToast} from "primevue/usetoast";
import {useForm} from "vee-validate";
import {computed, PropType, reactive, ref} from "vue";
import {date, number, object, string} from "yup";

import LoadingBtn from "@/coreComponents/button/LoadingBtn.vue";
import DialogFooter from "@/coreComponents/dialogs/DialogFooter.vue";
import DialogTitle from "@/coreComponents/dialogs/DialogTitle.vue";
import Const from "@/plugins/Constants";
import {fromAxiosError} from "@/plugins/ToastWriter";
import {useAuthStore} from "@/stores/auth";
import {useDataStore} from "@/stores/data";
import {useMyUserStore} from "@/stores/user";
import LoadingState from "@/types/LoadingState";
import {LoadingStates} from "@/types/LoadingStates";
import User from "@/types/User";

const props = defineProps({
  userToEdit: {type: Object as PropType<User>, required: false, default: undefined}
})

const emits = defineEmits(['success'])

const toast = useToast()
const dataStore = useDataStore()
const authStore = useAuthStore()
const userStore = useMyUserStore()

const genderOptions = [{id: 2, name: 'Female'}, {id: 3, name: 'Male'}]

const isEdit = computed((): boolean => !!props.userToEdit)

// ---------------
// API interaction
// ---------------
const withLogin = ref(false)
const {handleSubmit, resetForm, errors, useFieldModel, setValues} = useForm<User>({
  validationSchema: computed(() => toTypedSchema(object({
    firstName: string().required(),
    lastName: string().required(),
    birthDate: date().required().max(new Date()),
    genderId: number().required(),
    languageId: number().required(),
    nationalityId: number().required(),
    countryId: number().required(),
    primaryMail: withLogin.value ? string().required().email() : string().email(),
    oasi: string().test('has-valid-checksum', 'The OASI number is invalid', (value) => {
      // verify the OASI number according to the EAN-13 specification
      if (!value || value.charAt(value.length - 1) == '_') return true;
      const check_digit = value.charAt(value.length - 1)
      const digits = value.substring(0, value.length - 1).replaceAll('.', '')
      let sum = 0
      for (let i = 0; i < digits.length; i++) {
        const d = parseInt(digits.charAt(i))
        if (isNaN(d)) return false

        sum += i % 2 === 0 ? d : 3 * d
      }

      const computed_digit = (sum % 10 === 0) ? 0 : 10 - (sum % 10)
      return computed_digit === parseInt(check_digit)
    })
  })))
})
const newUser = reactive({
  firstName: useFieldModel('firstName'),
  lastName: useFieldModel('lastName'),
  birthDateObj: useFieldModel('birthDate'),
  genderId: useFieldModel('genderId'),
  languageId: useFieldModel('languageId'),
  nationalityId: useFieldModel('nationalityId'),
  oasi: useFieldModel('oasi'),
  primaryMail: useFieldModel('primaryMail'),
  primaryPhone: useFieldModel('primaryPhone'),
  address: useFieldModel('address'),
  houseNumber: useFieldModel('houseNumber'),
  postCode: useFieldModel('postCode'),
  city: useFieldModel('city'),
  countryId: useFieldModel('countryId'),
  birthDate: "",
  clubId: "",
})

const createState = reactive<LoadingState>({state: NaN})
const createUser = handleSubmit(() => {
  const url = isEdit.value ? `/users/${props.userToEdit?.id}` : '/users'
  const method = isEdit.value ? 'put' : 'post'

  newUser.clubId = userStore.user.clubId
  newUser.birthDate = moment(newUser.birthDateObj).format('YYYY-MM-DD')

  createState.state = LoadingStates.Loading
  axios.request({
    url, method,
    baseURL: Const.API_URL,
    headers: {
      'Authorization': 'Bearer ' + authStore.token
    },
    data: newUser
  }).then(() => {
    createState.state = LoadingStates.Loaded
    emits('success')
    setVisibility(false)
  }).catch((error: AxiosError) => {
    createState.state = LoadingStates.Error
    toast.add(fromAxiosError(error))
  })
})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean): void => {
  visible.value = val

  resetForm()
  if (props.userToEdit) {
    setValues(props.userToEdit)
    setValues({birthDate: new Date(props.userToEdit.birthDate)})
  }
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>