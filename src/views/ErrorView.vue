<template>
  <div>
    <component
      :error-content="errorContent"
      :is="targetComponent === 'payment-error' ? 'payment-error' : 'sb-error'"
    ></component>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "@vue/runtime-core";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
const route = useRoute();
const routeParams = computed(() => route.params.tag);
const targetComponent = ref("");
const { t } = useI18n();

/**
 * Watches for route parameter and renders view accordingly.
 */
watch(
  () => routeParams.value,
  (value) => {
    if (value) {
      targetComponent.value = routeParams.value as string;
    }
  },
  { immediate: true }
);

const errorContent = computed(() => {
  return errorText[targetComponent.value]
    ? errorText[targetComponent.value]
    : errorText.default;
});
const errorText = {
  default: t("error.valid link"),
  ["unauthorized-error"]: t("error.unauthorized"),
  ["server-error"]: t("error.server_error"),
};
</script>
