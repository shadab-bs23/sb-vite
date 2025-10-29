<template>
  <div class="position-sticky bottom-0 end-0 light-gray-bg py-1">
    <div
      class="d-flex justify-content-center align-items-center my-2 flex-wrap"
    >
      <p class="mb-0 px-2">{{ t("cookies.we_use_cookies") }}</p>
      <BaseButton
        type="button"
        button-class="sb-btn-md sb-btn-primary text-white btn-sm ms-2"
        @click="emit('acceptCookies')"
      >
        {{ t("cookies.accept") }}
      </BaseButton>
      <BaseButton
        type="button"
        button-class="sb-btn-md sb-btn-secondary ms-2"
        @click="emit('rejectCookies')"
      >
        {{ t("cookies.reject") }}
      </BaseButton>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";

const { t } = useI18n();
const emit = defineEmits(["acceptCookies", "rejectCookies"]);
</script>
