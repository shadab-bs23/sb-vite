<template>
  <div class="discount-ticket-wrapper p-4 light-gray-bg">
    <h4 class="text-start fw-bold ship-gray">
      {{ t("sharebus.ticket.need_tickets_for_yourself") }}
    </h4>
    <ButtonGroup :decision-for="DECISION_TYPE.YOUR_TICKET" />
    <div
      class="mt-3 text-start"
      v-if="decisionOnTicket === DECISION_RESULT.YES"
    >
      <p>{{ t("sharebus.ticket.how_many_tickets") }}</p>
      <div class="w-25">
        <BaseInput
          v-model="ticketsCount"
          type="number"
          :min="TICKET_NUMBER.MIN"
          :max="TICKET_NUMBER.MAX"
          :modifier-class="`${invalidTicketCountErr ? 'is-invalid' : ''}`"
          :feedback="invalidTicketCountErr && invalidTicketCountErr"
          feedback-class="text-nowrap"
          @keyup="(e) => handleKeyUpTickets(e)"
        />
      </div>
    </div>
    <p
      class="text-start py-3 ps-2 mt-2 auth-error fs-6 fw-600 mw-100 rounded"
      v-show="
        decisionOnTicket === DECISION_RESULT.INTERMEDIATE && submitBtnClicked
      "
    >
      {{ t("sharebus.answer_missing") }}
    </p>
  </div>
</template>
<script setup lang="ts">
import ButtonGroup from "@/components/modules/sharelead/setupSharebus/confirmation/ConfirmButton.vue";

import BaseInput from "@busgroup/vue3-base-input";
import { useI18n } from "vue-i18n";
import { computed, ref, watch } from "vue";
import { useSharebusStore } from "@/store";
import ShareBusSetUpController from "../Controllers/ShareBusSetUpController";
import { DECISION_RESULT, DECISION_TYPE } from "../enums/SetUpShareBusEnum";
import { STEPS } from "@/components/common/enums/enums";

const sharebus = useSharebusStore();
const { t } = useI18n();
const TICKET_NUMBER = ShareBusSetUpController.getTicketNumberLimit;
const submitBtnClicked = computed({
  get: () => ShareBusSetUpController.getSubmitState(STEPS.THREE),
  set: () => {
    ShareBusSetUpController.setSubmitState(STEPS.THREE);
  },
});
const ticketsCount = computed({
  get: () => sharebus.getStepThreeData.tickets as number,
  set: (value) => {
    sharebus.setStep3DataSpecific("tickets", value as number);
  },
});
const decisionOnTicket = computed(
  () => sharebus.getStepThreeData.shareLeadTicketDecision
);
const invalidTicketCountErr = ref("");
watch(
  () => decisionOnTicket.value,
  (value) => {
    if (value == DECISION_RESULT.NO) {
      ticketsCount.value = 0;
    }
  }
);
watch(
  () => ticketsCount.value,
  (value) => {
    if (
      value !== 0 &&
      (value < TICKET_NUMBER.value.MIN || value > TICKET_NUMBER.value.MAX)
    ) {
      invalidTicketCountErr.value = t("sharebus.ticket.invalid_ticket_cnt", {
        min: TICKET_NUMBER.value.MIN,
        max: TICKET_NUMBER.value.MAX,
      });
    } else invalidTicketCountErr.value = "";
  },
  {
    immediate: true,
  }
);

const handleKeyUpTickets = (e: Event) => {
  const eventData = (e.target as HTMLInputElement).value.toString();

  if (eventData.includes(".")) {
    ticketsCount.value = Number.parseInt(eventData.split(".")[0]);
  }
};
</script>
<style lang="scss"></style>
