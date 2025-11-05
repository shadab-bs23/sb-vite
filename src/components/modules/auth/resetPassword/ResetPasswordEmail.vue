<template>
  <div>
    <p class="text-start">
      {{ t("auth.forgot_password.let_us_send_code") }}
    </p>
    <BaseInput
      :label="t('auth.common.email')"
      label-class="w-100 text-start"
      modifierClass=""
      v-model="forgotPasswordInfo.userName"
      type="email"
    />
  </div>
  <div class="mt-2">
    <FormError
      error-class="auth-error p-3 rounded mt-2 text-danger fw-bold"
      :error="error"
    />
  </div>
  <div class="mt-2 buttons d-flex justify-content-between">
    <BaseButton
      @click="cancellingTheProcess()"
      :button-text="t('auth.forgot_password.cancel')"
      button-class="sb-btn-lg sb-btn-secondary  me-auto  py-2 rounded-pill mt-2"
    />
    <BaseButton
      @click="sendOtpToReset"
      button-class="sb-btn-primary sb-btn-lg   py-2 rounded-pill mt-2"
    >
      <div class="d-flex align-items-center justify-content-center">
        <span>{{ t("auth.common.reset_password") }}</span>
        <span class="fw-bold"><i class="fi fi-arrow-right-short"></i></span>
      </div>
    </BaseButton>
  </div>
</template>
<script lang="ts" setup>
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { isValidEmail, routePushTag } from "@/utils";
import { useSignUpStore, useUserStore } from "@/store";
import { computed, ref } from "vue";
import { GeneralError } from "types/errors/errors.type";
import FormError from "@/components/common/error/FormError.vue";
const { t } = useI18n();
const signUpStore = useSignUpStore();
const userStore = useUserStore();
const error = ref<GeneralError>({ message: "", type: "" });

const cancellingTheProcess = () => {
  signUpStore.$reset();
  routePushTag("auth", "signin");
};
const forgotPasswordInfo = computed({
  get: () => signUpStore.getSignUpInfo.forgotPassword,
  set: (value) => {
    signUpStore.handleForGotPasswordInfo({ userName: value as string });
  },
});

const ResetPasswordError = computed(() => ({
  ["ERR-NO-USER/FORGOT-PASS"]: t("auth.forgot_password.no_user_found"),
  ["ERR-UNVERIFIED-USER"]: t("auth.forgot_password.user_not_verified"),
  ["ERR-SOCIAL-USER"]: t(
    "auth.forgot_password.social_account_no_reset_password"
  ),
  ["PasswordResetError"]: t("auth.forgot_password.password_reset_error"),
  ["GeneralError"]: t("auth.forgot_password.general_error"),
}));

const sendOtpToReset = () => {
  if (isValidEmail(forgotPasswordInfo.value.userName as string)) {
    if (error.value) error.value = { message: "", type: "" };
    userStore
      .handleForgotPasswordCode(forgotPasswordInfo.value.userName as string)
      .then((res: any) => {
        if (res.data?.resetPassword) {
          signUpStore.handleForGotPasswordInfo({
            step: 2,
          });
        } else if (res.errors?.length) {
          error.value = {
            type: res.errors[0].errorType,
            message: ResetPasswordError.value[res.errors[0].errorType],
          };
        }
      })
      .catch((err) => {
        const { code, message } = err;
        error.value = {
          type: code,
          message: message,
        };
      });
  } else {
    error.value = {
      type: "",
      message: t("form.validation.invalid_email"),
    };
  }
};
</script>

<style lang="scss"></style>
