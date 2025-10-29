<template>
  <div class="discount-ticket-wrapper p-4 light-gray-bg mb-2 mt-2">
    <h4 class="text-start fw-bold ship-gray">
      {{ t("sharebus.active_discount.activate_ticket_discount") }}
    </h4>
    <p class="text-start ship-gray mw-100">
      {{ t("sharebus.active_discount.make_ticket_cheaper") }}
    </p>

    <ButtonGroup :decision-for="DECISION_TYPE.ACTIVATE_DISCOUNT" />

    <div
      class="discount-group-list mt-3"
      v-if="decisionOnDiscount === DECISION_RESULT.YES"
    >
      <ul class="list-group">
        <li
          v-if="!shareleadTickets && decisionOnTickets == DECISION_RESULT.NO"
          class="list-group-item d-flex align-items-center mw-100"
          :class="
            chosenDiscount === DISCOUNT_SCHEME.EARLY_BIRD
              ? 'selected-discount-border'
              : ''
          "
        >
          <BaseRadio
            id="early-bird"
            :value="DISCOUNT_SCHEME.EARLY_BIRD"
            modifier-class="radio-button-size"
            v-model="chosenDiscount"
          />
          <span class="ms-4"><img src="/img/discount-icon/bird.png" /></span>
          <div class="ms-3">
            <h5 class="text-start fw-bold ship-gray">
              {{ t("sharebus.active_discount.early_bird") }}
            </h5>
            <p class="text-start ship-gray">
              {{ t("sharebus.active_discount.ten_first_passenger_sentence") }}
            </p>
          </div>
        </li>
        <li
          class="list-group-item d-flex align-items-center mw-100"
          :class="
            chosenDiscount === DISCOUNT_SCHEME.CUT_PRICE
              ? 'selected-discount-border'
              : ''
          "
        >
          <BaseRadio
            id="cut-price"
            :value="DISCOUNT_SCHEME.CUT_PRICE"
            modifier-class="radio-button-size"
            v-model="chosenDiscount"
          />
          <span class="ms-4"
            ><img src="/img/discount-icon/scissors-board.png"
          /></span>
          <div class="ms-4">
            <h5 class="text-start fw-bold ship-gray">
              {{ t("sharebus.active_discount.cut_ticket_prices") }}
            </h5>
            <p class="text-start ship-gray">
              {{ t("sharebus.active_discount.all_passenger_sentence") }}
            </p>
          </div>
        </li>
      </ul>
    </div>
    <p
      class="text-start py-3 ps-2 mt-2 auth-error fs-6 fw-600 mw-100 rounded"
      v-show="
        decisionOnDiscount === DECISION_RESULT.INTERMEDIATE && submitBtnClicked
      "
    >
      {{ t("sharebus.answer_missing") }}
    </p>
    <ActiveDiscountCalculation v-if="chosenDiscount !== DISCOUNT_SCHEME.NONE" />
  </div>
</template>
<script lang="ts" setup>
// import BaseButton from "@busgroup/vue3-base-button";
import BaseRadio from "@busgroup/vue3-base-radio";
import { useI18n } from "vue-i18n";
import { computed, watch } from "vue";
import ActiveDiscountCalculation from "./ActiveDiscountCalculation.vue";
import {
  DISCOUNT_SCHEME,
  DECISION_TYPE,
  DECISION_RESULT,
} from "../enums/SetUpShareBusEnum";
import { useSharebusStore, useUserStore } from "@/store";
import ButtonGroup from "@/components/modules/sharelead/setupSharebus/confirmation/ConfirmButton.vue";
import ShareBusSetUpController from "../Controllers/ShareBusSetUpController";
import { ROLE, STEPS } from "@/components/common/enums/enums";

const sharebus = useSharebusStore();
const user = useUserStore();

const isSharelead = computed(() => user.currentRole === ROLE.SHARELEAD);

const shareleadTickets = computed(() => sharebus.getStepThreeData.tickets);

const submitBtnClicked = computed({
  get: () => ShareBusSetUpController.getSubmitState(STEPS.THREE),
  set: (value = true) => {
    ShareBusSetUpController.setSubmitState(STEPS.THREE, value);
  },
});

const decisionOnDiscount = computed({
  get: () => {
    return sharebus.getStepThreeData.shareLeadDiscountDecision;
  },
  set: (value) => {
    sharebus.setStep3DataSpecific("shareLeadDiscountDecision", value);
  },
});
const decisionOnTickets = computed(() =>
  isSharelead.value ? sharebus.getStepThreeData.shareLeadTicketDecision : 1
);
const discountSchema = computed(() => sharebus.getStepThreeData.discountScheme);

watch(
  () => shareleadTickets.value,
  (value) => {
    if (
      (value as number) > 0 &&
      chosenDiscount.value === DISCOUNT_SCHEME.EARLY_BIRD
    ) {
      chosenDiscount.value = DISCOUNT_SCHEME.NONE;
    }
  }
);
watch(
  () => decisionOnDiscount.value,
  (oldValue, newValue) => {
    if (oldValue !== newValue) {
      if (
        decisionOnTickets.value == DECISION_RESULT.YES &&
        decisionOnDiscount.value == DECISION_RESULT.YES
      ) {
        chosenDiscount.value = DISCOUNT_SCHEME.CUT_PRICE;
      } else {
        chosenDiscount.value = DISCOUNT_SCHEME.NONE;
      }
    }
  }
);

watch(
  () => decisionOnTickets.value,
  (oldValue, newValue) => {
    if (oldValue !== newValue) {
      submitBtnClicked.value = false;
      decisionOnDiscount.value = DECISION_RESULT.INTERMEDIATE;
    }
  }
);

watch(
  () => discountSchema.value,
  (oldValue, newValue) => {
    if (oldValue !== newValue) {
      sharebus.setStep3DataSpecific("discountPercentage", 0);
    }
  }
);

const chosenDiscount = computed({
  get: () => {
    return sharebus.getStepThreeData.discountScheme as string;
  },
  set: (value) => {
    sharebus.setStep3DataSpecific("discountScheme", value);
  },
});

const { t } = useI18n();
</script>
<style lang="scss">
.discount-group-list {
  background: #ffffff;
  .list-group-item {
    min-height: 91px;
  }
  li {
    margin-bottom: unset !important;
  }
}
.btn-group-discount button:not(:last-child) {
  border-right: none; /* Prevent double borders */
}
.btn-group-discount button {
  border: 1px solid #d5d6d5;
  border-radius: 0%;
}
.btn-group-discount button:hover {
  background-color: #138340 !important;
  color: #fefffe !important;
}
.btn-discount-size {
  height: 35px;
}
.radio-button-size {
  height: 18px;
  width: 18px;
}
.selected-discount-border {
  border: 1px solid #138340 !important;
}
</style>
