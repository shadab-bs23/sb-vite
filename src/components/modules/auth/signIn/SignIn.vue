<template>
  <div class="mt-1">
    <div class="row flex-column d-flex align-items-center">
      <h1 class="col-md-6 col-lg-4 col-sm-12 mb-4 text-black">
        {{ t("auth.common.sign_in_to_sharebus") }}
      </h1>

      <GoogleSignUp
        class="col-md-6 col-lg-4 col-sm-12 mb-4"
        :title="t('auth.sign_in.sign_in_with_google')"
      />

      <div
        class="d-flex col-md-6 col-lg-4 col-sm-12 mb-2 justify-content-between"
      >
        <a
          @click="routePushTag('auth', 'signup')"
          class="float-start sb-tertiary"
          >{{ t("auth.common.new_user") }}
        </a>

        <a
          @click="routePushTag('auth', 'forgot-password')"
          class="float-start sb-tertiary"
          >{{ t("auth.sign_in.forgot_password") }}</a
        >
      </div>
      <form @submit.prevent="handleSubmit" class="col-md-6 col-lg-4 col-sm-12">
        <BaseInput
          id="email"
          input-group-class="signup-input"
          :label="t('auth.common.email')"
          v-model="loginData.email"
          type="text"
          modifier-class="auth-input-height text-start mx-1"
          autofocus
        />
        <div class="d-flex align-items-center signup-input">
          <BaseInput
            id="password"
            :label="t('auth.common.password')"
            v-model="loginData.password"
            modifier-class="text-start auth-input-height mx-1"
            :type="show ? 'text' : 'password'"
          />
          <BaseButton
            type="button"
            @click="toggleShow"
            buttonClass="bg-white border-light h-100 border-0"
          >
            <template v-slot:default>
              <i
                class="fas"
                :class="{
                  'fi fi-eye fs-3': !show,
                  'fi fi-eye-slash fs-3': show,
                }"
              ></i>
            </template>
          </BaseButton>
        </div>

        <FormError
          error-class="auth-error p-3 rounded mt-1 col-12 mx-auto"
          :error="error"
        />

        <div class="col-12 mx-auto mt-4">
          <BaseButton
            :button-text="t('auth.common.sign_in')"
            type="submit"
            :is-disabled="!activeSignInButton"
            button-class="sb-btn-lg sb-btn-primary fw-bold rounded-pill w-100"
          />
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";
import GoogleSignUp from "@/components/modules/auth/signUp/GoogleSignUpButton.vue";
import { checkRolePermissions, routePushTag } from "@/utils";
import { useI18n } from "vue-i18n";
import { useUserStore, useSignUpStore } from "@/store/index";
import { useToggle } from "@/composables/useToggle";
import { computed } from "@vue/reactivity";
import { UserSignIn } from "types/auth/user.type";
import { GeneralError } from "types/errors/errors.type";
import FormError from "@/components/common/error/FormError.vue";
import { showToast } from "@/services/toast/toast.service";
import { useRoute } from "vue-router";
import { useRedirect } from "@/services/auth/redirect.service";

const { t } = useI18n();
const user = useUserStore();
const userSignUp = useSignUpStore();
const error = ref<GeneralError>({ message: "", type: "" });
const loginData = reactive<UserSignIn>({ email: "", password: "" });
const { show, toggleShow } = useToggle();
const route = useRoute();

/*
 * Set query to localstorage for redirecting after authenticate
 * */
useRedirect().setRedirectAfterAuthenticate(route.query);

const activeSignInButton = computed(
  () => loginData.email.length > 0 && loginData.password.length > 0
);
const isLoggedIn = computed(() => user.getUserInfo.username);

const handleSubmit = () => {
  if (isLoggedIn.value.length > 0) {
    user.signOutAction();
  }
  userSignUp.$reset();
  const email = loginData.email.toLowerCase();
  loginData.email = email;
  user
    .signInAction(loginData)
    .then((res) => {
      if (res) {
        user
          .fetchingUserInfo()
          .then((res) => {
            if (!res.attributes.email_verified) {
              user
                .handleVerifyUserAttribute("email")
                .then(() => {
                  userSignUp.handleSignUpInfo({
                    username: loginData.email,
                    password: loginData.password,
                    attributes: {
                      phone_number: "",
                      name: "",
                    },
                  });
                  routePushTag("auth", "verify-auth");
                })
                .catch((err) => {
                  const { code, message } = err;
                  error.value = {
                    type: code,
                    message: message,
                  };
                });
            } else {
              checkRolePermissions(user.roles);
              useRedirect().redirect();
            }
          })
          .catch((err) => showToast("error", err));
      }
    })
    .catch((err) => {
      const { code, message } = err;
      if (code === "UserNotConfirmedException") {
        reUserConfirmingProcess(loginData);
      }
      if (code === "NotAuthorizedException") {
        error.value = {
          type: code,
          message: message,
        };
      }
    });
};
const reUserConfirmingProcess = (loginData) => {
  userSignUp.handleSignUpInfo({
    username: loginData.email,
    password: loginData.password,
    attributes: {
      phone_number: "",
      name: "",
    },
  });
  resendConfirmation(loginData.email);
};
const resendConfirmation = (username: string) => {
  user.handleResendConfirmationCode(username).then(() => {
    routePushTag("auth", "verify-auth");
  });
};
</script>
