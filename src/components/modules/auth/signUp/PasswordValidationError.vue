<template>
  <ul :class="customClass">
    <h1>Your password must contain:</h1>
    <li
      v-for="(data, index) in passwordValidation"
      :key="index"
      :class="data.value ? validationIcon.success : validationIcon.error"
    >
      &nbsp; {{ data.validationMessage }}
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { PasswordValidation } from "../../../../../types/auth/user.type";
import { regexPasswordValidation } from "@/utils";

const props = defineProps({
  /**
   * @property {string} password -it contains a string which is a password
   */
  password: {
    type: String,
    required: true,
  },
  /**
   * @property {string} customClass -it contains a string which is a class
   * @default "password-error"
   */
  customClass: {
    type: String,
    default: "password-error",
  },
});
const { t } = useI18n();

const validationIcon = {
  error: "error fi fi-x-circle-fill",
  success: "success fi fi-check-lg",
};
const passwordValidation = ref<PasswordValidation>({
  min8Character: {
    value: false,
    validationMessage: t("auth.sign_up.error.min_char_error"),
  },
  upperCase: {
    value: false,
    validationMessage: t("auth.sign_up.error.upper_case_error"),
  },
  lowerCase: {
    value: false,
    validationMessage: t("auth.sign_up.error.lower_case_error"),
  },
  number: {
    value: false,
    validationMessage: t("auth.sign_up.error.number_error"),
  },
  specialCharacter: {
    value: false,
    validationMessage: t("auth.sign_up.error.symbol_error"),
  },
});
const isPasswordValid = (value: string) => {
  passwordValidation.value.min8Character.value =
    value.length > 7 ? true : false;
  passwordValidation.value.upperCase.value = value.match(/(.*[A-Z].*)/)
    ? true
    : false;
  passwordValidation.value.lowerCase.value = value.match(/(.*[a-z].*)/)
    ? true
    : false;
  passwordValidation.value.number.value = value.match(/(.*[0-9].*)/)
    ? true
    : false;
  passwordValidation.value.specialCharacter.value = value.match(
    regexPasswordValidation
  )
    ? true
    : false;
};

/*
 * watching is otp digit 4 or not
 */
watch(
  () => props.password,
  (newValue, oldValue) => {
    if (oldValue !== newValue) {
      isPasswordValid(newValue as string);
    }
  }
);
</script>
<style lang="scss">
.password-error {
  margin: 10px 0;
  padding: 15px;
  border: 1px solid #d5d6d5;
  border-radius: 5px;
  h1 {
    margin-left: 0;
    font-size: 15px;
    text-align: left;
  }
  li {
    list-style: none;
    text-align: left;
    color: #dc3545;
    &.success {
      color: var(--ferdia-c1-green-jewel1);
    }
  }
}
</style>
