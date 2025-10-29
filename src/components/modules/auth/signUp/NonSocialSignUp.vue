<template>
  <div class="row flex-column d-flex align-items-center mt-1">
    <h1 class="col-md-6 col-lg-4 col-sm-12 mb-4 text-black">
      {{ t("auth.sign_up.create_your_sharebus_account") }}
    </h1>
    <GoogleSignUp class="col-md-6 col-lg-4 col-sm-12 mb-4" />
    <div
      class="d-flex col-md-6 col-lg-4 col-sm-12 mb-2 justify-content-between"
    >
      <a class="sb-tertiary" @click="routePushTag('auth', 'signin')">{{
        t("auth.common.existing_user")
      }}</a>
      <a @click="routePushTag('auth', 'forgot-password')" class="sb-tertiary">
        {{ t("auth.sign_in.forgot_password") }}</a
      >
    </div>
    <form @submit.prevent="onSubmit" class="col-md-6 col-lg-4 col-sm-12">
      <div class="form-input-wrapper col-md-12 col-sm-12 col-lg-12">
        <BaseInput
          input-group-class="signup-input"
          :label="t('auth.common.name')"
          v-model="values.attributes.name"
          :feedback="nameErrMsg"
          :modifier-class="`${nameErrMsg ? 'is-invalid' : ''} text-start`"
          type="text"
        />
        <div class="tel-input-wrapper">
          <label>{{ t("auth.common.phone_number") }}</label>
          <BasePhoneInput
            v-model="values.attributes.phone_number"
            @validate="phoneInputChange"
            class="mb-2 p-1"
            :errorMessage="phone_numberErrMsg"
          />
        </div>
        <BaseInput
          input-group-class="signup-input"
          :label="t('auth.common.email')"
          v-model="values.username"
          type="text"
          :modifier-class="`${
            usernameErrMsg ? 'is-invalid' : ''
          }  auth-input-height text-start`"
          :feedback="usernameErrMsg"
        />
        <div class="d-flex align-items-center signup-input">
          <BaseInput
            :label="t('auth.common.password')"
            v-model="values.password"
            modifier-class="text-start"
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

        <PasswordValidationError
          v-show="values.password.length > 0"
          :password="values.password"
        />
      </div>
      <FormError error-class="auth-error p-3 rounded mt-2" :error="error" />
      <TermAccept />
      <p
        class="error-input-color text-start p-2 mt-2"
        v-show="submitCount > 0 && !isFormCanSubmit"
      >
        {{ t("form.validation.field_missing_or_invalid") }}
      </p>
      <div class="col-md-12 col-sm-12 col-lg-12 mt-3">
        <BaseButton
          type="submit"
          :buttonText="t('auth.sign_up.create_account')"
          button-class="sb-btn-lg sb-btn-primary fw-bold rounded-pill w-100"
        >
        </BaseButton>
      </div>
    </form>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore, useSignUpStore } from "@/store/index";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { routePushTag, regexPasswordValidation } from "@/utils";
import AuthController from "../controller/AuthController";
import BaseButton from "@busgroup/vue3-base-button";
import TermAccept from "./TermsAcceptComponent.vue";
import GoogleSignUp from "./GoogleSignUpButton.vue";
import { GeneralError } from "types/errors/errors.type";
import { useLoaderStore } from "@/store/index";
import PasswordValidationError from "./PasswordValidationError.vue";
import { useToggle } from "@/composables/useToggle";
import { phoneNumberRule } from "@/utils/validation.utils";
import FormError from "@/components/common/error/FormError.vue";
import BaseInput from "@busgroup/vue3-base-input";

const loader = useLoaderStore();

const storeUser = useUserStore();
const storeSignUp = useSignUpStore();
const { t } = useI18n();
const { show, toggleShow } = useToggle();

const isPhoneValid = ref<boolean>(false);

/*
 * Phone number validation
 * */
const phoneInputChange = (value) => {
  isPhoneValid.value = value;
};

/*
 * getting and setting state and signup process details
 */
const signUpProcess = computed(() => {
  return AuthController.getSignupProcessDetails();
});

/*
 * is having any error
 */
const error = ref<GeneralError>({ message: "", type: "" });
/*
 * is form can submit or not calculating here
 */
const isFormCanSubmit = computed(() => {
  return meta.value.valid && signUpProcess.value.isTermsAccepted;
});
/*
 * validation schema for form define in here
 */
const validationSchema = computed(() =>
  yup.object({
    username: yup
      .string()
      .required("No email provided")
      .email("Email not valid"),
    password: yup
      .string()
      .required("No password provided.")
      .min(8, "At least 8 characters")
      .matches(/(.*[a-z].*)/, "Lower case letters (a-z)")
      .matches(/(.*[A-Z].*)/, "Upper case letters (A-Z)")
      .matches(/(.*\d.*)/, "Numbers (0-9)")
      .matches(regexPasswordValidation, "At least one special character"),
    attributes: yup.object({
      phone_number: phoneNumberRule(isPhoneValid.value),
      name: yup
        .string()
        .required("No name provided.")
        .matches(/.*\S.*/, "No name provided")
        .min(3, "At least 3 characters"),
      "custom:isProfileComplete": yup.string(),
    }),
  })
);
/*
 * getting validated value and also if form validated or not as meta
 */
const { handleSubmit, values, meta, submitCount } = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: validationSchema as Record<string, any>,
  initialValues: {
    username: "",
    password: "",
    attributes: {
      phone_number: "",
      name: "",
    },
  },
});

const { errorMessage: usernameErrMsg } = useField("username");
const { errorMessage: nameErrMsg } = useField("attributes.name");
const { errorMessage: phone_numberErrMsg } = useField(
  "attributes.phone_number"
);
useField("password");

/*
 * after validating form calling here to access api
 */
const onSubmit = handleSubmit((values) => {
  if (!isFormCanSubmit.value) return;
  storeUser.signOutAction();
  const phoneNumber = values.attributes.phone_number;
  const userName = values.username.toLowerCase();
  values.attributes.phone_number = phoneNumber.replace(/\s+/g, "");
  values.username = userName;
  storeSignUp.handleSignUpInfo(values);
  loader.changeLoadingStatus({ isLoading: true });
  storeUser
    .handleSignUp(values)
    .then(async (result) => {
      loader.changeLoadingStatus({ isLoading: false });
      if (result.user) {
        await storeUser.fetchingUserInfo();
        routePushTag("auth", "verify-auth");
      }
    })
    .catch((err) => {
      loader.changeLoadingStatus({ isLoading: false });
      const { code, message } = err;
      error.value = {
        type: code,
        message: message,
      };
    });
});
</script>
<style lang="scss" scoped></style>
