<template>
  <div class="text-start ship-gray">
    <h3 class="red-carnation mb-0">
      {{ t("sharebus.joiner.booking.cancel_booking") }}
    </h3>
    <h3 class="mb-3">{{ tripInfo.name }}</h3>
    <p class="fw-600">{{ t("sharebus.joiner.booking.you_dont_join") }}</p>

    <p>
      {{
        t("sharebus.joiner.booking.you_will_cancel_tickets", {
          tickets: joinerTickets,
        })
      }}
    </p>
    <p>{{ t("sharebus.joiner.booking.you_will_refunded") }}</p>
    <div class="border border-1 border-light p-3">
      <p class="fw-600 mb-3">{{ t("auth.common.are_u_sure") }}</p>
      <p>{{ t("common.confirm_by_email") }}</p>
      <EmailForm @on-submit-email="handleSubmitEmail">
        <template v-slot:submitButton>
          <BaseButton
            button-text="Yes, please cancel"
            button-class="sb-btn-danger sb-btn-lg rounded red-carnation-border red-carnation fw-600 mt-2"
          />
        </template>
      </EmailForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "@busgroup/vue3-base-button";
import EmailForm from "@/components/modules/auth/forms/EmailForm.vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  tripInfo: {
    type: Object,
    required: true,
  },
});

const { t } = useI18n();

const emit = defineEmits(["onValidEmail"]);

const joinerTickets = computed(() => {
  return props.tripInfo.ticket.length;
});

const handleSubmitEmail = (email: string) => {
  if (email) {
    emit("onValidEmail");
  }
};
</script>

<style lang="scss" scoped>
@use "@/assets/css/utility_classes" as *;
.btn-hover {
  color: $red-carnation;
}
</style>
