<template>
  <form @submit.prevent="onSubmitEmail" class="mb-2">
    <BaseInput
      v-model="emailForm.values.email"
      name="email"
      :modifier-class="emailErrMsg ? 'is-invalid' : ''"
      :feedback="emailErrMsg"
    />
    <slot name="submitButton">
      <BaseButton
        type="submit"
        :button-text="t('button.submit')"
        button-class="btn-primary
          mt-2"
      />
    </slot>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";

const emit = defineEmits(["onSubmitEmail"]);

const { t } = useI18n();
const user = useUserStore();

const userInfo = computed(() => user.getUserInfo.attributes);

/*
 * validation schema for email form
 */
const emailValidationSchema = computed(() =>
  yup.object({
    email: yup.string().required("No email provided").email("Email not valid"),
  })
);

/*
 * getting validated value and also if form validated or not as meta
 */
const emailForm = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: emailValidationSchema,
  initialValues: {
    email: "",
  },
});

const { errorMessage: emailErrMsg, setErrors: setEmailError } =
  useField("email");

/*
 * after validating form calling here to access api
 */
const onSubmitEmail = emailForm.handleSubmit((values) => {
  if (userInfo.value.email === values.email) {
    emit("onSubmitEmail", values.email);
  } else {
    setEmailError("This email does not belongs to your account");
  }
});
</script>
