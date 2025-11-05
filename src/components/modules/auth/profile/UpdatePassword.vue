<template>
  <BaseButton
    v-if="!show"
    @click="toggleShow"
    :button-text="t('auth.profile.change_password')"
    button-class="rounded-pill sb-btn-secondary sb-btn-lg"
  />
  <form @submit.prevent="onSubmit" v-if="show">
    <div class="border rounded p-4 w-100">
      <BaseInput
        :label="t('auth.profile.current_password')"
        v-model="values.current_password"
        modifier-class="text-start w-100 rounded"
        input-group-class="d-flex flex-column "
        type="password"
      />
      <p class="error-input-color fw-bold mt-1">{{ currentPasswordErrMsg }}</p>
      <BaseInput
        :label="t('auth.profile.new_password')"
        v-model="values.password"
        modifier-class="text-start w-100 rounded"
        input-group-class="d-flex flex-column mt-2"
        type="password"
      />
      <PasswordValidationErrorVue
        v-if="values.password.length > 0"
        :password="values.password"
      />
      <BaseInput
        :label="t('auth.profile.repeat_new_password')"
        v-model="values.repeat_password"
        modifier-class="text-start w-100 rounded"
        input-group-class="d-flex flex-column mt-2"
        type="password"
      />
      <p class="error-input-color fw-bold mt-1">{{ repeatPasswordErrMsg }}</p>
      <p class="warning-msg fw-bold" v-if="currentPasswordErrMsg && currentPasswordErrMsg.length > 0">
        {{ t("auth.profile.please_chose_diffrent_password") }}
      </p>
      <div class="d-flex mt-3">
        <BaseButton
          @click="cancelAndReset"
          :button-text="t('auth.profile.cancel')"
          button-class="sb-btn-secondary sb-btn-lg rounded-pill fw-bold"
        />
        <BaseButton
          type="submit"
          :button-text="t('auth.profile.change_password')"
          button-class="ms-2 rounded-pill sb-btn-lg sb-btn-primary fw-bold"
        />
      </div>
      <p class="ship-gray mt-3">{{ t("auth.profile.have_you_forgotten") }}</p>
      <p class="mt-3 fw-bold green-jewel" v-if="passwordUpdateMsg">
        {{ passwordUpdateMsg }}
      </p>
      <p class="mt-3 fw-bold green-jewel" v-if="meta.touched && !meta.valid">
        {{ t("form.validation.field_missing_or_invalid") }}
      </p>
    </div>
  </form>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { computed, ref } from "vue";
import * as yup from "yup";
import { useToggle } from "@/composables/useToggle";
import { useField, useForm } from "vee-validate";
import PasswordValidationErrorVue from "../signUp/PasswordValidationError.vue";
import { changePassword } from "@/services/auth/auth.service";
import { useLoaderStore } from "@/store";
import { regexPasswordValidation } from "@/utils";
const { show, toggleShow } = useToggle();
const passwordUpdateMsg = ref("");
const loader = useLoaderStore();

/*
 * validation schema for form define in here
 */
const validationSchema = computed(() =>
  yup.object({
    current_password: yup
      .string()
      .notOneOf(
        [yup.ref("password"), null],
        "New passwords must be different than current password"
      ),
    password: yup
      .string()
      .required("No password provided.")
      .min(8, "At least 8 characters")
      .matches(/(.*[a-z].*)/, "Lower case letters (a-z)")
      .matches(/(.*[A-Z].*)/, "Upper case letters (A-Z)")
      .matches(/(.*\d.*)/, "Numbers (0-9)")
      .matches(regexPasswordValidation, "At least one special character"),
    repeat_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  })
);
/*
 * getting validated value and also if form validated or not as meta
 */
const { handleSubmit, values, resetForm, meta } = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: validationSchema as Record<string, any>,
  initialValues: {
    current_password: "",
    password: "",
    repeat_password: "",
  },
});
const { errorMessage: repeatPasswordErrMsg } = useField("repeat_password");
const { errorMessage: currentPasswordErrMsg } = useField("current_password");

const { t } = useI18n();
const cancelAndReset = () => {
  resetForm();
  toggleShow();
  passwordUpdateMsg.value = "";
};
const onSubmit = handleSubmit((values) => {
  loader.changeLoadingStatus({ isLoading: true });
  passwordUpdateMsg.value = "";
  changePassword(values.current_password, values.password)
    .then((result) => {
      loader.changeLoadingStatus({ isLoading: false });
      passwordUpdateMsg.value = result;
      resetForm();
    })
    .catch((error) => {
      loader.changeLoadingStatus({ isLoading: false });
      const { message } = error;
      passwordUpdateMsg.value = message;
    });
});
</script>
<style lang="scss">
.warning-msg {
  color: #d4001a;
}
</style>
