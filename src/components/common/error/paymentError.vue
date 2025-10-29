<template>
  <div class="d-flex flex-column align-items-center">
    <!-- it is added for temporary , for this there have no design -->
    <h1>{{ t("common.payment_error") }}</h1>
    <BaseButton
      @click="backToPreviousStage()"
      :button-text="roleBaseRedirection[user.currentRole].btnText"
      button-class="sb-btn-secondary sb-btn-lg py-2 rounded-pill mt-2"
    />
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import { useUserStore } from "@/store/index";
import { useRoute } from "vue-router";
import { ROLE } from "../enums/enums";
import { routePushMultipleTag, routePushTag } from "@/utils";

const { t } = useI18n();
const user = useUserStore();
const route = useRoute();

const roleBaseRedirection = {
  [ROLE.JOINER]: {
    btnText: t("button.back_to_booking_page"),
    redirect: (tripId: string) => routePushTag("book-ticket", tripId),
  },
  [ROLE.SHARELEAD]: {
    btnText: t("button.retry_payment"),
    redirect: (tripId: string) =>
      routePushMultipleTag("payment", {
        tag: "confirm-and-book",
        id: tripId,
      }),
  },
};

const backToPreviousStage = () => {
  roleBaseRedirection[user.currentRole].redirect(route.params.id);
};
</script>
