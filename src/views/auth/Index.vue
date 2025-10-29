<template>
  <component :is="targetComponent"></component>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import SignIn from "@/components/modules/auth/signIn/SignIn.vue";
import NonSocialSignUp from "@/components/modules/auth/signUp/NonSocialSignUp.vue";
import SocialSignUp from "@/components/modules/auth/signUp/SocialSignUp.vue";
import VerifyAuth from "@/components/modules/auth/signUp/VerifyAuth.vue";
import ForgotPassWord from "@/components/modules/auth/resetPassword/index.vue";

const routeParams = computed(() => route.params.tag);
const targetComponentName = ref("" as string | string[]);
const route = useRoute();

watch(
  () => routeParams.value,
  (value) => {
    if (value) {
      targetComponentName.value = value;
    }
  },
  { immediate: true }
);
const authComponentList = {
  signup: NonSocialSignUp,
  "create-account": SocialSignUp,
  signin: SignIn,
  "verify-auth": VerifyAuth,
  "forgot-password": ForgotPassWord,
};

const targetComponent = computed(() => {
  return authComponentList[targetComponentName.value as string];
});
</script>
<style lang="scss">
.auth-input-height {
  height: 100px;
  width: 100%;
}

.auth-button {
  height: 48px;
}

.social-auth-button {
  border: 1px solid #d5d6d5;
}

.auth-divider::before {
  content: "";
  display: block;
  width: 45%;
  height: 1px;
  margin-right: 5%;
  background: #d5d6d5;
}

.auth-divider::after {
  content: "";
  display: block;
  width: 45%;
  height: 1px;
  margin-left: 5%;
  background: #d5d6d5;
}

// for registration
.registration-btn {
  background-color: var(--ferdia-c1-green-jewel1);
  width: 100%;
  height: 50px;
  &:disabled {
    background-color: #f4f5f4;
    color: #000000 !important;
  }
}
.invalid-feedback {
  text-align: start;
}

.tel-input-wrapper {
  padding: 17px;
  border: 1px solid #dedede;
  text-align: left;
  border-top: 0;
  border-bottom: 0;
  label {
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;
    color: #000000;
  }
  .vue-tel-input {
    border: none;
    .vti__dropdown {
      padding-left: 0;
      .vti__flag {
        margin-left: 0;
      }
    }
  }
  .vti__country-code {
    font-weight: bold;
    opacity: 0.7;
  }
}
.signup-input {
  &:first-child {
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
  }
  &:last-child {
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }
}
.error-wrapper {
  background: #feebe7;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  padding: 12px;
}
</style>
