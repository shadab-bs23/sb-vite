<template>
  <BaseConfirmationModal
    :modal-id="modalId || 'discard-changes-modal'"
    :modelValue="show"
    @update:modelValue="handleModelValueUpdate"
  >
    <template v-slot:header>
      <slot name="header">
        <h3>{{ t("setup.discard.header") }}</h3>
      </slot>
    </template>
    <template v-slot:content>
      <slot name="content">
        <p class="fw-bold mb-5">{{ t("setup.discard.confirm") }}</p>
        <p>{{ t("setup.discard.warning") }}</p>
      </slot>
    </template>
    <template v-slot:footer>
      <slot name="footer">
        <div class="d-flex gap-3">
          <BaseButton
            button-class="sb-btn-lg sb-btn-primary"
            :button-text="t('setup.discard.stay')"
            @click="$emit('cancel')"
          />
          <BaseButton
            button-class="sb-btn-lg sb-btn-danger"
            :button-text="t('setup.discard.leave')"
            @click="$emit('confirm')"
          />
        </div>
      </slot>
    </template>
  </BaseConfirmationModal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import BaseButton from "@busgroup/vue3-base-button";
import BaseConfirmationModal from "@busgroup/vue3-base-confirmation-modal";

const { t } = useI18n();

defineProps<{
  show: boolean;
  modalId?: string;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const handleModelValueUpdate = (value: boolean) => {
  if (!value) {
    emit("update:show", false);
  }
};
</script>
