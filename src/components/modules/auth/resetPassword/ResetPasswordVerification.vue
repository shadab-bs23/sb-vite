<template>
  <div class="row flex-column d-flex align-items-center">
    <div>
      <p class="text-start">
        <span>{{ t("auth.verify.otp_info_text") }}</span>
        <span class="fw-bold"> &nbsp; {{ forgotPasswordInfo.userName }}</span>
      </p>
      <p class="mt-3 text-start">
        {{ t("auth.verify.type_code_from_email") }}:
      </p>
      <div>
        <BaseInput
          input-group-class="verify-input"
          type="text"
          v-model="forgotPasswordInfo.code"
        />
      </div>
    </div>

    <div class="text-start pt-3 d-flex">
      <BaseButton
        @click="backToPreviousStage()"
        :button-text="t('button.back')"
        button-class="col-sm-12 col-md-3 col-lg-3 me-auto  py-2 rounded-pill sb-btn-lg sb-btn-secondary mt-2"
      />
      <BaseButton
        type="submit"
        class="sb-btn-primary sb-btn-lg p-2 mt-2"
        @click="sendOtpToReset"
      >
        <i class="fi fi-arrow-clockwise"></i>
        {{ t("auth.common.resend_code") }}
      </BaseButton>
    </div>
    <FormError error-class="auth-error p-3 rounded mt-2" :error="error" />
  </div>
</template>
<script lang="ts" setup>
import { useSignUpStore, useUserStore } from "@/store";
import { GeneralError } from "././types/errors/errors.type";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
const { t } = useI18n();
const signUpStore = useSignUpStore();
const userStore = useUserStore();
const forgotPasswordInfo = computed({
  get: () => signUpStore.getSignUpInfo.forgotPassword,
  set: (value) => {
    signUpStore.handleForGotPasswordInfo({ code: value as string });
  },
});

const error = ref<GeneralError>({ message: "", type: "" });

/*
 * watching is otp digit 4 or not
 */
watch(
  () => forgotPasswordInfo.value.code as string,
  (value) => {
    if (value?.length == 6) {
      signUpStore.handleForGotPasswordInfo({
        step: 3,
      });
    }
  },
  { immediate: true }
);
const sendOtpToReset = () => {
  userStore
    .handleForgotPasswordCode(forgotPasswordInfo.value.userName as string)
    .catch((err) => {
      const { code, message } = err;
      error.value = {
        type: code,
        message: message,
      };
    });
};

const backToPreviousStage = () => {
  signUpStore.handleForGotPasswordInfo({
    step: 1,
    code: null,
  });
};
</script>
