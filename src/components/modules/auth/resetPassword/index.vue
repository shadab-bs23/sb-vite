<template>
  <div class="row flex-column d-flex align-items-center p-3">
    <div class="col-sm-12 col-md-6 col-lg-4 mb-2">
      <h1 class="text-start">{{ t("auth.common.reset_password") }}</h1>
    </div>

    <div class="col-sm-12 col-md-6 col-lg-4">
      <ResetPasswordEmail v-if="forgotPasswordState.step == 1" />
      <ResetPasswordVerification v-if="forgotPasswordState.step == 2" />
      <ResetPassword v-if="forgotPasswordState.step == 3" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import ResetPasswordEmail from "./ResetPasswordEmail.vue";
import ResetPasswordVerification from "./ResetPasswordVerification.vue";
import ResetPassword from "./ResetPassword.vue";
import { useI18n } from "vue-i18n";
import { useSignUpStore } from "@/store";
import { computed } from "vue";
import { ForgotPassword } from "@/store/signUp/types";
const { t } = useI18n();
const userSignUStore = useSignUpStore();
const forgotPasswordState = computed<ForgotPassword>(
  () => userSignUStore.getSignUpInfo.forgotPassword
);
</script>

<style lang="scss">
.btn-back {
  background: #f8f9fa;
}
</style>
