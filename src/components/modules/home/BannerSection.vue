<template>
  <!-- Top section for banner starts -->
  <section class="row">
    <div
      class="col-sm-12 col-md-6 col-lg-6 d-flex flex-column justify-content-center"
    >
      <p class="fs-2">
        {{ t("home.what_is") }}
        <span class="text-success fw-bold">{{ t("home.sharebus") }}</span
        >?
      </p>
      <div class="text-start w-75 align-self-center pt-4">
        <SingleFeature :serial-no="1">
          <template v-slot:text>
            <p>
              <span class="fw-bold">{{ t("home.set_up") }}</span>
              {{ t("home.a_public_sharebus") }}
            </p>
          </template>
        </SingleFeature>
        <SingleFeature :serial-no="2">
          <template v-slot:text>
            <p>
              <span class="fw-bold">{{ t("home.publish_the_bus") }}</span>
              {{ t("home.and_watch_the_bus_sentences") }}
            </p>
          </template>
        </SingleFeature>
        <SingleFeature :serial-no="3" :border="false">
          <template v-slot:text>
            <p>
              <span class="fw-bold">{{ t("home.get_your_tickets") }}</span>
              {{ t("home.and_travel_environmentally_responsible") }}
            </p>
          </template>
        </SingleFeature>
      </div>
      <BaseButton
        class="px-4 sb-btn-lg sb-btn-primary align-self-center rounded-pill fw-bolder my-3 d-flex justify-content-between align-items-center"
        @click="goToSetUpShareBus"
      >
        <template v-slot:default>
          <span>{{ t("home.set_up_a_sharebus") }}</span>
          <span class="ms-2 fw-bold"
            ><i class="fi fi-arrow-right-short"></i
          ></span>
        </template>
      </BaseButton>
    </div>
    <div
      class="col-sm-12 col-md-6 col-lg-6 d-flex flex-column justify-content-center"
    >
      <img src="/img/sharebus.svg" class="img-fluid w-100" />
    </div>
  </section>
  <!-- Top section for banner ends -->
</template>

<script setup lang="ts">
import SingleFeature from "./features/SingleFeature.vue";
import BaseButton from "@busgroup/vue3-base-button";
import { routePush, routePushTagQuery } from "@/utils";
import { useI18n } from "vue-i18n";
import { showToast } from "@/services/toast/toast.service";
import { computed } from "vue";
import { useUserStore } from "@/store";
import { ROLE } from "@/components/common/enums/enums";
const { t } = useI18n();
const user = useUserStore();
const userDetails = computed(() => user.$state);
const goToSetUpShareBus = () => {
  if (!user.isAuthenticated) {
    routePushTagQuery("auth", "signin", { redirectUrl: "/setup-sharebus" });
  } else if (
    user.currentRole !== ROLE.SHARELEAD &&
    user.currentRole !== ROLE.PARTNER_SHARELEAD &&
    !user.roles.includes(ROLE.SHARELEAD)
  ) {
    showToast(
      "info",
      t("home.setup_sharebus_permission_denied"),
      6000,
      "top-left"
    );
    return;
  } else if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    user.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 6000, "top-left");
    return;
  } else {
    routePush("setup-sharebus");
  }
};
</script>
