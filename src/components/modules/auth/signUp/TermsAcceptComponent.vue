<template>
  <div class="col-md-12 col-sm-12 col-lg-12 d-flex mt-5">
    <div class="align-self-start">
      <input
        v-model="isTermsAccepted"
        @change="isTermsAccept"
        type="checkbox"
        id="switch"
      /><label class="label" for="switch"></label>
    </div>
    <div>
      <span>
        {{ t("auth.sign_up.accept_ferdia") }}
        <a class="sb-tertiary" @click="toggleModal">{{
          t("auth.sign_up.terms")
        }}</a>
        &
        <a class="sb-tertiary" @click="toggleModal">{{
          t("auth.sign_up.privacy_policy")
        }}</a>
        {{ t("auth.sign_up.accept_ferdia_second_sentence") }}
      </span>
    </div>
  </div>
  <div>
    <BaseModal
      id="sampleModal"
      v-model="isModalOpen"
      footer-class="justify-content-center"
      modifier-class="fade"
      dialog-modifier-class="modal-dialog-centered"
      dialogClass="modal-lg"
    >
      <template v-slot:header> </template>
      <template v-slot:closeButton>
        <div
          class="d-flex col-md-12 align-items-center justify-content-end w-100"
          @click="toggleModal"
        >
          <BaseButton
            type="button"
            button-class="sb-btn-secondary sb-btn-lg rounded-circle"
          >
            <i class="fi fi-x green-jewel"></i>
          </BaseButton>
        </div>
      </template>
      <template v-slot:content>
        <TermsAndConditionsVue />
      </template>
      <template v-slot:footer>
        <BaseButton
          type="button"
          button-class="sb-btn-secondary sb-btn-lg rounded-pill"
          @click="toggleModal"
        >
          <span>Close</span>
          <i class="fi fi-x green-jewel ms-1"></i>
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseModal from "@busgroup/vue3-base-modal";
import BaseButton from "@busgroup/vue3-base-button";

import TermsAndConditionsVue from "@/components/common/termsAndConditions/TermsAndConditions.vue";
import AuthController from "../controller/AuthController";

const { t } = useI18n();
const isModalOpen = ref(false);
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value;
};
/*
 * is terms accepted or not mounting here
 */
const isTermsAccepted = ref(false);

const isTermsAccept = () => {
  AuthController.setSignupProperty("isTermsAccepted", isTermsAccepted.value);
};
</script>
<style lang="scss" scoped>
input[type="checkbox"] {
  height: 0;
  width: 0;
  visibility: hidden;
  background: #d5d6d5;
}

.label {
  cursor: pointer;
  text-indent: -9999px;
  width: 69px;
  height: 32px;
  background: #d5d6d5;
  border-radius: 16px;
  position: relative;
}

.label:after {
  content: "";
  position: absolute;
  background: #0c1026;
  left: 0;
  width: 32px;
  height: 32px;
  border-radius: 90px;
  transition: 0.3s;
}

input:checked + label {
  background: #a5f2c4;
}

input:checked + label:after {
  left: 100%;
  transform: translateX(-100%);
}

.label:active:after {
  width: 130px;
}
</style>
