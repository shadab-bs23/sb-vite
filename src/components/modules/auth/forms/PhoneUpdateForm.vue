<template>
  <p class="text-black">{{ t("auth.common.phone_number") }}</p>
  <h5 class="fw-bold text-black" v-show="!changePhone.show.value">
    {{ !phoneLengthInitial.hasDialCode ? `+${dialCode}` : ""
    }}{{ values.phone }}
  </h5>
  <form @submit.prevent v-show="changePhone.show.value" class="mb-2">
    <BaseTelInput
      :default-country="47"
      v-model="values.phone"
      @onCountryChanged="handleCountryInfo"
      :input-option-props="{
        required: false,
        name: 'phone_no',
        placeholder: '',
        maxlength: phoneLengthInitial.length,
      }"
      :input-props="{
        autoDefaultCountry: false,
        mode: 'international',
        validCharactersOnly: true,
      }"
      :shouldHavecountryCode="false"
    >
      <template v-slot:message>
        <p v-if="phoneErrMsg" class="text-danger">
          {{ phoneErrMsg }}
        </p>
      </template>
    </BaseTelInput>
    <BaseButton
      :button-text="t('button.submit')"
      button-class="btn-primary mt-2"
      @click="onSubmitPhone"
    />
  </form>
  <BaseButton
    v-show="!changePhone.show.value"
    :button-text="t('auth.profile.change_phone_number')"
    button-class="bg-white rounded border-dark"
    @click="changePhone.toggleShow()"
  />
</template>

<script setup lang="ts">
//this component functionality will be use in post MVP
import { computed, reactive, ref, watch } from "vue";
import * as yup from "yup";
import BaseTelInput from "@busgroup/vue3-base-tel-input";
import BaseButton from "@busgroup/vue3-base-button";
import { countryObject } from "././types/auth/user.type";
import { useField, useForm } from "vee-validate";
import { phoneNumberMaxLength, phoneNumberMinLength } from "@/utils";
import { useUserStore } from "@/store";
import { useI18n } from "vue-i18n";
import { useToggle } from "@/composables/useToggle";

const { t } = useI18n();
const user = useUserStore();
const changePhone = useToggle();
const userInfo = computed(() => user.getUserInfo.attributes);
const dialCode = ref("47");
/**
 * Fires when country changed (even for the first time)
 *
 * @param {countryObject}  value getting country info
 */
const handleCountryInfo = (value: countryObject) => {
  dialCode.value = value.dialCode;
};

const phoneLengthInitial = reactive({
  hasDialCode: true,
  length: user.data.attributes.phone_number?.length,
});

/*
 * validation schema for phone number form
 */
const phoneValidationSchema = computed(() =>
  yup.object({
    phone: yup
      .string()
      .required("required")
      .min(
        phoneLengthInitial.length as number,
        `At least ${phoneLengthInitial.length} digits`
      ),
  })
);

/*
 * getting validated value and also if form validated or not as meta
 */
const { handleSubmit, values } = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: phoneValidationSchema,
  initialValues: {
    phone: userInfo.value.phone_number,
  },
});

const { errorMessage: phoneErrMsg } = useField("phone");

watch(
  () => values.phone,
  (value) => {
    if (value?.includes(dialCode.value)) {
      phoneLengthInitial.hasDialCode = true;
      phoneLengthInitial.length = phoneNumberMaxLength[dialCode.value];
      return;
    }
    phoneLengthInitial.hasDialCode = false;
    phoneLengthInitial.length = phoneNumberMinLength[dialCode.value];
  }
);

/*
 * after validating form calling here to access api
 */
const onSubmitPhone = handleSubmit((values) => {
  const phone = `${phoneLengthInitial.hasDialCode ? "" : `+${dialCode.value}`}${
    values.phone
  }`;
  values.phone = phone;
  changePhone.toggleShow();
});
</script>
