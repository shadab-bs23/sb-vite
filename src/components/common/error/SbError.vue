<template>
  <div>
    <img src="/img/error-info-bg.svg" />
    <h1 class="fw-bold mt-2">{{ t("error.oops") }}</h1>
  </div>
  <div>
    <span> {{ errorContent }} </span>
  </div>
  <div class="mt-2">
    <span
      >{{ t("error.try_to") }}
      <a class="text-decoration-underline" href="/">
        {{ t("error.reload_your_page") }}</a
      >
      {{ t("error.or") }}
      <a
        href="https://sharebus.zendesk.com/hc/en-us/requests/new"
        target="_blank"
        class="text-decoration-underline"
        >{{ t("error.contact_support") }}</a
      >
    </span>
  </div>
  <div class="mt-5">
    <BaseButton
      button-class="sb-btn-lg sb-btn-primary rounded-pill p-2"
      @click="routerPushHash('/')"
    >
      <div class="px-4">
        <span class="gray-white">{{ t("error.visit") }} Sharebus.co</span>
        <span class="ms-2"
          ><img src="/img/trip-info/right-arrow-white.svg"
        /></span>
      </div>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import { routerPushHash } from "@/utils";

const { t } = useI18n();
defineProps({
  errorContent: {
    type: String,
    required: true,
  },
});
</script>
<style lang="scss">
.button-background {
  background: #138340;
}
</style>
