<template>
  <div class="d-flex flex-column align-items-center mt-3">
    <div class="card col-md-6 col-lg-6 col-xl-4">
      <div class="card-body">
        <p class="text-start ship-gray">
          {{ t("sharebus.active_discount.discount") }}
        </p>
        <div class="d-flex align-items-center">
          <span class="float-start fw-bold">
            <BaseInput
              id="discountAmount"
              type="number"
              min="0"
              max="100"
              v-model="modelValue"
              :modifier-class="`ship-gray fw-bold border-discount-box border-1 rounded-bottom fs-1 text-start border-start-0 border-end-0 border-top-0 h-100 ${
                errorMessage?.length ? `error-input-color` : ``
              }`"
            />
          </span>
          <span><i class="fi fi-percent ship-gray"></i></span>
        </div>
        <div
          class="border rounded p-3 mt-1 error-bg lh-1"
          v-if="errorMessage?.length"
        >
          <p class="fw-bold ship-gray text-start">
            {{ t("sharebus.active_discount.change_the_discount") }}
          </p>
          <p class="ship-gray text-start">
            {{ t("sharebus.active_discount.discount_too_high") }}
          </p>
        </div>
        <p class="text-start ship-gray" v-text="errorMessage"></p>
        <h4
          class="text-start fw-bold ship-gray mt-2"
          v-text="ticketPriceText"
        ></h4>
        <div class="d-flex align-items-center">
          <span class="float-start ship-gray fw-bold fs-1" v-text="ticketPrice">
          </span>
          <span>&nbsp; Kr</span>
        </div>
        <div class="extended-light-green-bg rounded p-3">
          <p class="ship-gray">
            {{ t("sharebus.active_discount.your_deductible") }}
          </p>
          <div class="d-flex align-items-center justify-content-center">
            <span class="ship-gray fw-bold fs-1"
              >{{ stepThreeInfo.deductibleAmount }}
            </span>
            <span>&nbsp; Kr</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useConfigStore, useSharebusStore } from "@/store";
import { useField } from "vee-validate";
import { DISCOUNT_SCHEME } from "../enums/SetUpShareBusEnum";

const { t } = useI18n();
const sharebus = useSharebusStore();
const config = useConfigStore();

onMounted(() => {
  setValue(sharebus.getPassengerGoalAndPriceStepData.discountPercentage || 0);
});

const ticketPriceText = computed(() =>
  stepThreeInfo.value.discountScheme === DISCOUNT_SCHEME.EARLY_BIRD
    ? t("sharebus.active_discount.early_bird_price")
    : t("sharebus.active_discount.new_ticket_price")
);
const ticketPrice = computed(() =>
  stepThreeInfo.value.discountScheme === DISCOUNT_SCHEME.EARLY_BIRD
    ? stepThreeInfo.value.earlyBirdTicketPrice
    : stepThreeInfo.value.ticketPrice
);
const disCountLimit = {
  [DISCOUNT_SCHEME.CUT_PRICE]:
    config.getSharebusSetupConfig.CutPriceDiscountLimit,
  [DISCOUNT_SCHEME.EARLY_BIRD]:
    config.getSharebusSetupConfig.EarlyBirdDiscountLimit,
};
const discountPercentage = computed({
  get: () => {
    return sharebus.getPassengerGoalAndPriceStepData.discountPercentage;
  },
  set: (value) => {
    sharebus.setPassengerGoalAndPriceStepDataSpecific("discountPercentage", value as number);
  },
});
const stepThreeInfo = computed(() => {
  return sharebus.getPassengerGoalAndPriceStepData;
});
const { value, errorMessage, handleChange, setValue, setErrors } =
  useField("percentage");

const modelValue = computed({
  get: () => {
    return value.value;
  },
  set: (value) => {
    setValue(value);
    handleError();
  },
});
/**
 *handle discount error generic
 *
 * @param {number} percentage that what you are getting from input
 * @param {number} percentageLimit the limit we have to validate
 */
const handleDiscountErrorCheck = (
  percentage: number,
  percentageLimit: number
) => {
  if (percentage > percentageLimit) {
    setErrors(
      `${t("sharebus.active_discount.maximum_discount_is")} ${percentageLimit}%`
    );
    discountPercentage.value = 0;
  } else {
    setErrors([]);
    discountPercentage.value = percentage;
  }
};

/**
 * Not necessary to use NOW but keeping this for future purpose
 * this function is for handling validation for discount limit
 */
const handleError = () => {
  let percentage = value.value as number;
  if (percentage > 100) {
    handleChange(100);
  }
  if (percentage < 0) {
    handleChange(0);
  }
  switch (stepThreeInfo.value.discountScheme as string) {
    case DISCOUNT_SCHEME.CUT_PRICE:
      handleDiscountErrorCheck(
        percentage,
        disCountLimit[DISCOUNT_SCHEME.CUT_PRICE]
      );

      break;
    case DISCOUNT_SCHEME.EARLY_BIRD:
      handleDiscountErrorCheck(
        percentage,
        disCountLimit[DISCOUNT_SCHEME.EARLY_BIRD]
      );

      break;
    default:
      discountPercentage.value = 0;
  }
};

watch(
  () => stepThreeInfo.value.discountScheme,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      handleChange(0);
      handleError();
    }
  }
);
</script>
<style>
.border-discount-box {
  border-bottom: 1px solid #757675;
  width: 76px !important;
  height: 31px;
}
</style>
