<template>
  <div class="d-flex flex-wrap gap-1">
    <BaseButton
      button-class="sb-btn-md sb-btn-secondary me-2"
      @click="action(false)"
      >{{ t("button.cancel") }}</BaseButton
    >
    <BaseButton button-class="sb-btn-md sb-btn-primary" @click="action(true)"
      >{{ t("button.save_changes") }}
    </BaseButton>
  </div>
</template>
<script lang="ts" setup>
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["saveChanges"]);

const action = (value: boolean) => {
  emit("saveChanges", value);
};
</script>
