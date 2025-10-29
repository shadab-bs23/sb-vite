<template>
  <div
    class="publish-sb ship-gray extended-light-green-bg text-start px-4 py-4 mt-3 rounded"
  >
    <h3>{{ t("sharebus.publish.publish_your_sharebus") }}</h3>
    <p class="ship-gray">{{ t("sharebus.publish.sharebus_invisible") }}</p>
    <BaseButton
      button-class="sb-btn-primary sb-btn-lg mt-2 rounded-pill fw-bold  d-flex justify-content-center align-items-center"
      @click="handlePublishSharebus"
    >
      <span>{{ t("sharebus.publish.publish") }}</span>
      <span class="ms-1"><i class="fi fi-chevron-right"></i></span>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ROLE } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import { useTripStore, useUserStore } from "@/store";
import { routePushTag } from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const user = useUserStore();
const shareLeadTripStore = useTripStore();

const userDetails = computed(() => user);

const handlePublishSharebus = () => {
  if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 6000, "top-left");
    return;
  }
  routePushTag("publish-sharebus", shareLeadTripStore.getCurrentTrip.id);
};
</script>
