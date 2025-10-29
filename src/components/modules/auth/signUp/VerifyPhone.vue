<template>
  <div class="row flex-column d-flex align-items-center m-1">
    <div class="col-md-4 col-sm-12 col-lg-3">
      <h1 class="text-black text-start">
        {{ t("auth.verify.verify_mobile_phone") }}
      </h1>
      <p
        class="text-start"
        v-if="userSignUpInfo.signUp.attributes.phone_number"
      >
        {{ t("auth.verify.otp_info_text") }} ******{{
          getLastXDigit(userSignUpInfo.signUp.attributes.phone_number)
        }}
      </p>
      <p class="mt-3 text-start">{{ t("auth.verify.type_code_from_sms") }}:</p>
      <InputOtp v-model="verifyOtp" :length="6" />

      <div class="text-start pt-3">
        <BaseButton
          type="submit"
          class="border-0 verify-resend"
          @click="resendVerification"
        >
          <i class="fi fi-arrow-clockwise"></i>
          {{ t("auth.common.resend_code") }}
        </BaseButton>
      </div>
      <FormError error-class="auth-error p-3 rounded mt-2" :error="error" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref, watch, computed } from "vue";
import { useLoaderStore, useSignUpStore, useUserStore } from "@/store/index";
import BaseButton from "@busgroup/vue3-base-button";
import { getLastXDigit } from "@/utils";
import { GeneralError } from "types/errors/errors.type";
import { useRedirect } from "@/services/auth/redirect.service";
import { defineAsyncComponent } from "vue";
const InputOtp = defineAsyncComponent(
  () => import("@/components/common/reusable/InputOtp.vue")
);
const error = ref<GeneralError>({ message: "", type: "" });

const loader = useLoaderStore();
const storeSignUp = useSignUpStore();
const storeUser = useUserStore();

const { t } = useI18n();
/*
 * otp is bind here
 */
const verifyOtp = ref("");

const userInfo = computed(() => {
  return storeUser.getUserInfo;
});

/*
 *getting signup info for use email
 */
const userSignUpInfo = computed(() => {
  return storeSignUp.getSignUpInfo;
});
const providerType = computed(() => {
  if (userInfo.value && userSignUpInfo.value) {
    const identities = userInfo.value.attributes.identities;
    if (identities && userSignUpInfo.value.isSocialSignUp) {
      const parseIdentities = JSON.parse(identities);
      return parseIdentities[0].providerName;
    }
  }
  return "";
});

/*
 * watching is otp digit 4 or not
 */
watch(
  () => verifyOtp.value,
  (value) => {
    if (value.length == 6) {
      if (providerType.value === "Google") {
        verifyUnverifiedAttribute("phone_number", value);
      } else {
        verifyCodeNonSocial(value);
      }
    }
  },
  { immediate: true }
);

/**
 * calling this function for verifying code
 *
 * @param {string} value -greeting the value for match
 */
const verifyCodeNonSocial = (value) => {
  loader.changeLoadingStatus({ isLoading: true });

  storeUser
    .handleConfirmSignUp(storeSignUp.getSignUpInfo.signUp.username, value)
    .then(() => {
      loader.changeLoadingStatus({ isLoading: false });
      storeUser
        .signInAction({
          email: storeSignUp.getSignUpInfo.signUp.username,
          password: storeSignUp.getSignUpInfo.signUp?.password as string,
        })
        .then(async () => {
          await storeUser.fetchingUserInfo();
          await storeUser.handleVerifyUserAttribute("email");
        });
    })
    .catch((err) => {
      loader.changeLoadingStatus({ isLoading: false });
      const { code, message } = err;
      error.value = {
        type: code,
        message: message,
      };
    });
};

const verifyUnverifiedAttribute = (attribute: string, value: string) => {
  loader.changeLoadingStatus({ isLoading: true });

  storeUser
    .handleUserUnverifiedAttribute(attribute, value)
    .then(() => {
      storeUser.$patch({ isAuthenticated: true });
      loader.changeLoadingStatus({ isLoading: true });
      storeUser.fetchingUserInfo();
      storeSignUp.$reset();
      useRedirect().redirect();
    })
    .catch((err) => {
      loader.changeLoadingStatus({ isLoading: false });
      const { code, message } = err;
      error.value = {
        type: code,
        message: message,
      };
    });
};

const resendVerification = () => {
  error.value = {
    type: "",
    message: "",
  };
  if (providerType.value === "Google") {
    handleUnverifiedUserAttribute();
  } else {
    resendCodeToNonsocial();
  }
};
const handleUnverifiedUserAttribute = () => {
  storeUser.handleVerifyUserAttribute("phone_number");
};
const resendCodeToNonsocial = () => {
  storeUser.handleResendConfirmationCode(
    storeSignUp.getSignUpInfo.signUp.username
  );
};
</script>
<style>
.verify-input {
  height: 75px;
  border-radius: 2px;
}

.verify-resend {
  font-weight: 400;
  border: 1px solid #e6e6e6 !important;
  background: #ffffff;
  color: #0c1026;
}
.verify-cancel {
  font-weight: 400;
  background: #f8f9fa;
  color: #343a40;
}
.change-phone {
  text-decoration: underline;
}
</style>
