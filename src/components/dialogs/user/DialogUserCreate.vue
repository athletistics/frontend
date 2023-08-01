<template>
  <Dialog v-model:visible="visible" modal class="xl:max-w-5xl sm:max-w-none">
    <form ref="userCreateForm">

      <div class="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-8 gap-x-4">

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.firstName') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.lastName') }}*</label>
        </span>

        <span class="p-float-label p-fluid">
          <Calendar id="name" :class="{'p-invalid': errors.name}"/>
          <label for="name">{{ $t('glob.user.birthdate') }}*</label>
        </span>

<!--        <span class="p-float-label p-fluid">-->
<!--          <Dropdown id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}"/>-->
<!--          <label for="name">{{ $t('glob.user.gender') }}*</label>-->
<!--        </span>-->

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.oasi') }}</label>
        </span>

<!--        <span class="p-float-label p-fluid">-->
<!--          <Dropdown id="name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>-->
<!--          <label for="name">{{ $t('glob.user.nationality') }}*</label>-->
<!--        </span>-->

<!--        <span class="p-float-label p-fluid">-->
<!--          <Dropdown id="name" :class="{'p-invalid': errors.name}"/>-->
<!--          <label for="name">{{ $t('glob.user.prefLang') }}*</label>-->
<!--        </span>-->

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.primaryMail') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.primaryPhone') }}</label>
        </span>

        <!--        todo: couple with email requirement -->
        <span class="p-float-label p-fluid">
          <InputSwitch id="name" :class="{'p-invalid': errors.name}"/>
          <label for="name">{{ $t('glob.user.withLogin') }}*</label>
        </span>

      </div>

      <hr class="mt-4">

      <div class="grid lg:grid-cols-3 sm:grid-cols-2 gap-y-8 gap-x-4">
        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.address') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.houseNumber') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.postCode') }}</label>
        </span>

        <span class="p-float-label p-fluid">
          <InputText id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}" v-tooltip="errors.name"/>
          <label for="name">{{ $t('glob.user.city') }}</label>
        </span>

<!--        <span class="p-float-label p-fluid">-->
<!--          <Dropdown id="name" v-model="newUser.name" :class="{'p-invalid': errors.name}"/>-->
<!--          <label for="name">{{ $t('glob.user.country') }}</label>-->
<!--        </span>-->
      </div>

    </form>

    <template #header>
      <DialogTitle>{{ $t('page.athletes.create') }}</DialogTitle>
    </template>

    <template #footer>
      <DialogFooter>
        <LoadingBtn full outlined visual-type="primary" :loading="createState" @click="createUser()">
          {{ $t('glob.btn.create') }}
        </LoadingBtn>
        <LoadingBtn full outlined @click="setVisibility(false)">{{ $t('glob.btn.cancel') }}</LoadingBtn>
      </DialogFooter>
    </template>
  </Dialog>
</template>


<script setup lang="ts">
import Dialog from "primevue/dialog";
import DialogTitle from "@/components/dialogs/DialogTitle.vue";
import DialogFooter from "@/components/dialogs/DialogFooter.vue";
import LoadingBtn from "@/components/button/LoadingBtn.vue";
import {reactive, ref} from "vue";
import {useForm} from "vee-validate";
import {object, string} from "yup";
import User from "@/types/User";
import LoadingState from "@/types/LoadingState";

// ---------------
// API interaction
// ---------------
const {handleSubmit, resetForm, errors, useFieldModel} = useForm<User>({
  validationSchema: object({
    name: string().required().min(3)
  })
})
const newUser = reactive<User>({})

const createState = reactive<LoadingState>({state: NaN})
const createUser = handleSubmit(_ => {

})

// ----------------------------
// dialog visibility management
// ----------------------------
const visible = ref(false)
const setVisibility = (val: boolean) => {
  visible.value = val

  resetForm()
}

defineExpose({
  setVisibility
})
</script>

<style scoped>

</style>