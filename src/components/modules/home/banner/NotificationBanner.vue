<template>
  <div class="notification-background px-4 py-2">
    <span><img src="/img/trip-info/info-icon-green.svg" /></span>
    <span class="ms-2 ship-gray fw-bold">{{ notificationText }}</span>
    <span class="fw-bold"
      ><a
        class="text-decoration-underline ship-gray"
        :href="CTA.SUPPORT"
        target="_blank"
      >
        {{ t("common.visit_support_page") }}</a
      ></span
    >
  </div>
</template>
<script lang="ts" setup>
import { useConfigStore } from "@/store";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { CTA } from "@/components/common/enums/enums";

const { t } = useI18n();

const config = useConfigStore();

const notificationText = computed(
  () => config.getSharebusSetupConfig.NotificationBannerText
);
CTA.SUPPORT;
</script>
<style lang="scss">
.notification-background {
  background: #fdf292;
}
</style>
