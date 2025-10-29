<template>
  <form @submit.prevent="onSubmit">
    <div class="row flex-column d-flex align-items-center">
      <div>
        <BaseInput
          :label="t('auth.common.choose_password')"
          label-class="w-100 text-start"
          modifierClass=""
          type="password"
          v-model="values.password"
        />
        <PasswordValidationError
          v-if="values.password.length > 0"
          :password="values.password"
        />
      </div>
      <div class="mt-3">
        <BaseInput
          :label="t('auth.common.reset_password')"
          label-class="w-100 text-start"
          modifierClass=""
          type="password"
          v-model="values.repeat_password"
        />
        <p class="mt-2 text-start">{{ repeatPasswordErrMsg }}</p>
      </div>
      <div class="mt-2 buttons">
        <BaseButton
          @click="backToPreviousStage()"
          :button-text="t('button.back')"
          button-class="col-sm-12 col-md-3 col-lg-3 me-auto sb-btn-secondary sb-btn-lg py-2 rounded-pill mt-2"
        />
        <BaseButton
          type="submit"
          button-class="col-sm-12 col-md-6 col-lg-6 offset-md-3 offset-lg-3 sb-btn-lg sb-btn-primary py-2 rounded-pill mt-2"
        >
          <div class="d-flex align-items-center justify-content-center">
            <span>{{ t("auth.common.reset_password") }}</span>
            <span class="fw-bold"><i class="fi fi-arrow-right-short"></i></span>
          </div>
        </BaseButton>
      </div>
      <div class="mt-4 border rounded" v-if="passwordUpdateMsg.length > 0">
        <p class="fw-bold green-jewel p-3" v-if="passwordUpdateMsg">
          {{ passwordUpdateMsg }}
        </p>
      </div>
    </div>
  </form>
</template>
<script lang="ts" setup>
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { useLoaderStore, useSignUpStore, useUserStore } from "@/store";
import { computed, ref } from "vue";
import * as yup from "yup";
import { useField, useForm } from "vee-validate";
import PasswordValidationError from "../signUp/PasswordValidationError.vue";
import { regexPasswordValidation, routePushTag } from "@/utils";

const { t } = useI18n();
const signUpStore = useSignUpStore();
const userStore = useUserStore();
const backToPreviousStage = () => {
  signUpStore.handleForGotPasswordInfo({
    step: 2,
    code: null,
  });
};

const userSignUp = computed(() => {
  return signUpStore.getSignUpInfo.forgotPassword;
});

const passwordUpdateMsg = ref("");
const loader = useLoaderStore();
/*
 * validation schema for form define in here
 */
const validationSchema = computed(() =>
  yup.object({
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
const { handleSubmit, values, resetForm } = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: validationSchema as Record<string, any>,
  initialValues: {
    password: "",
    repeat_password: "",
  },
});

const onSubmit = handleSubmit((values) => {
  loader.changeLoadingStatus({ isLoading: true });
  passwordUpdateMsg.value = "";
  userStore
    .handleForgotPasswordSubmit({
      username: userSignUp.value.userName as string,
      code: userSignUp.value.code as string,
      new_password: values.password,
    })
    .then(() => {
      loader.changeLoadingStatus({ isLoading: false });
      passwordUpdateMsg.value =
        "Password updated successfully, redirecting to login page...";
      setTimeout(() => {
        signUpStore.$reset();
        routePushTag("auth", "signin");
      }, 5000);
      resetForm();
    })
    .catch((error) => {
      loader.changeLoadingStatus({ isLoading: false });
      const { message } = error;
      passwordUpdateMsg.value = message;
    });
});
const { errorMessage: repeatPasswordErrMsg } = useField("repeat_password");
</script>

<style lang="scss">
.btn-back {
  background: #f8f9fa;
}
</style>
