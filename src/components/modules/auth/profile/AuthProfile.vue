<template>
  <div class="row flex-column d-flex align-items-center m-1">
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4">
      <h1 class="text-start text-black">{{ t("auth.profile.profile") }}</h1>
      <div class="text-start pt-3" v-if="providerType == 'Google'">
        <span class="border rounded p-2">
          <img src="/img/gmail.svg" />
          {{ t("auth.profile.connected_with_google") }}
        </span>
      </div>
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4">
      <p class="text-start text-black text-black">
        {{ t("auth.profile.name") }}
      </p>
      <h5 class="fw-bold text-start text-black">
        {{ userInfo.attributes.name }}
      </h5>
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4 text-start">
      <p class="text-black">{{ t("auth.common.phone_number") }}</p>
      <h5 class="fw-bold text-black">
        {{ userInfo.attributes.phone_number }}
      </h5>
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4 text-start">
      <p class="text-black">{{ t("auth.common.email") }}</p>
      <h5 class="fw-bold text-black">
        {{ userInfo.attributes.email }}
      </h5>
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4 text-start">
      <p class="text-black">{{ t("auth.common.password") }}</p>
      <UpdatePasswordVue v-if="providerType !== 'Google'" />
      <div class="d-flex change-password-info-bg rounded p-2" v-else>
        <span>
          <img src="/img/trip-info/info-blue.svg" />
          <span class="ms-2 fw-bold">{{
            t("auth.profile.visit_profile_page_change_password")
          }}</span>
        </span>
      </div>
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-4 text-start">
      <BaseButton
        :button-text="t('auth.profile.delete_profile')"
        button-class="sb-btn-lg sb-btn-danger rounded-pill"
        @click="confirmationModal.toggleShow"
      />
    </div>
    <div class="col-md-6 col-lg-6 col-sm-12 mb-2 text-start ship-gray">
      <ReusableContactInfoVue
        v-for="(contactInfo, index) in profileContactInfo"
        :key="index"
        :contact-info="contactInfo"
      />
    </div>

    <BaseConfirmationModal
      modal-id="confirmResetModal"
      v-model="confirmationModal.show.value"
    >
      <template v-slot:header>
        <h3 title="Form modal">{{ t("auth.profile.delete_profile") }}</h3>
      </template>
      <template v-slot:content>
        <p class="fw-600">{{ t("auth.profile.delete_user_description") }}</p>
      </template>
      <template v-slot:footer>
        <BaseButton
          button-class="sb-btn-lg sb-btn-primary rounded-pill"
          button-text="Yes"
          @click="handleDeleteUser"
        />
        <BaseButton
          button-text="No"
          button-class="sb-btn-lg sb-btn-danger rounded-pill"
          @click="confirmationModal.toggleShow"
        />
      </template>
    </BaseConfirmationModal>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import BaseConfirmationModal from "@busgroup/vue3-base-confirmation-modal";
import UpdatePasswordVue from "./UpdatePassword.vue";
import { useUserStore } from "@/store/index";
import ReusableContactInfoVue from "./ReusableContactInfo.vue";
import { useToggle } from "@/composables/useToggle";
import { showToast } from "@/services/toast/toast.service";
import { routePush } from "@/utils";
import { ROUTE } from "@/router/enum/routeEnums";

const { t } = useI18n();
const user = useUserStore();

const confirmationModal = useToggle();

const userInfo = computed(() => user.getUserInfo);
const providerType = computed(() => {
  if (userInfo.value) {
    const identities = userInfo.value?.attributes.identities;
    if (identities) {
      const parseIdentities = JSON.parse(identities);
      return parseIdentities[0].providerName;
    }
  }
  return "";
});
const profileContactInfo = computed(() => [
  {
    title: t("auth.profile.change_profile_info"),
    description: t("auth.profile.change_profile_info_description"),
    action_title: t("auth.profile.change_profile_info_action_text"),
    action_link: "https://www.ferdia.co/no/contact",
  },
]);

const handleDeleteUser = () => {
  confirmationModal.toggleShow();

  user.deleteUser().then((result) => {
    const { status } = result?.data.deleteUserInfo;
    if (status === 200) {
      showToast("success", t("auth.common.account_deleted"));
      user.signOutAction().then(() => routePush(ROUTE.HOME));
    } else {
      showToast("error", t("auth.common.fail_delete_account"));
    }
  });
};
</script>
<style>
.placeholder-custom::placeholder {
  font-weight: normal;
}
.custom-height-confirm {
  min-height: 250px;
}
.change-password-info-bg {
  background-color: #e5f8fa;
}
</style>
