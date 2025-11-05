<template>
  <div class="row">
    <div class="col-md-5 col-lg-5 col-xl-4">
      <div class="p-4 pb-3">
        <BaseButton
          button-class=" fw-bold d-flex align-items-center sb-btn-secondary sb-btn-lg"
          @click="() => prevStep()"
        >
          <span class="pt-1"
            ><i class="fi fi-chevron-left fs-5 icon-text-stroke"></i
          ></span>
          <span class="ms-2">{{ t("button.back") }}</span>
        </BaseButton>
      </div>
      <TripInfoDetails :trip-info="departureInfo" class="my-4 px-4" />
      <TripInfoDetails
        v-if="returnInfo.departureDateTime"
        :trip-info="returnInfo"
        :is-return-trip="true"
        class="px-4"
      />
    </div>
    <div class="col-md-7 col-lg-7 col-xl-8">
      <div class="discount-ticket-wrapper p-4 light-gray-bg mb-2">
        <h3 class="text-start">
          {{ t("sharebus.choose_passenger_goal") }}
        </h3>
        <div class="pass-goal-input mt-2">
          <BaseInput
            v-model="passengerGoalCalculable"
            :placeholder="(passengerGoalCalculable as number).toString()"
            type="number"
            :min="PASSENGER_GOAL.MIN"
            :max="PASSENGER_GOAL.MAX"
            :modifier-class="`${invalidSeatCountErr ? 'is-invalid' : ''}`"
            :feedback="invalidSeatCountErr && invalidSeatCountErr"
            feedback-class="text-nowrap"
            @keyup="(e) => handleKeyUpPG(e)"
          />
        </div>
        <div class="mt-3 mb-4">
          <BaseRangeSlider
            v-model="passengerGoalCalculable"
            label-text="Range"
            :min="PASSENGER_GOAL.MIN"
            :max="PASSENGER_GOAL.MAX"
            :pb2-value="tickets"
            :pb2-desc="t('sharebus.ticket.your_tickets')"
          />
        </div>
        <PassengerGoalGeneralInfo
          v-if="isHaveBonusTickets < 0"
          :passenger-goal-deadline=" subtractDaysFromDate(
                  setUpInfo1.route_points.oneway[0]?.planned_departure_time 
                    ? (typeof setUpInfo1.route_points.oneway[0].planned_departure_time === 'string' 
                        ? setUpInfo1.route_points.oneway[0].planned_departure_time 
                        : setUpInfo1.route_points.oneway[0].planned_departure_time instanceof Date
                          ? isoFormatDateTime(setUpInfo1.route_points.oneway[0].planned_departure_time.toISOString())
                          : isoFormatDateTime(String(setUpInfo1.route_points.oneway[0].planned_departure_time)))
                    : '',
                  setupConfig.PassengerGoalDeadlineDays  
                )"
          :passenger-goal="passengerGoal"
        />
        <PassengerGoalBonusInfo
          v-if="isHaveBonusTickets > 0 || isHaveBonusTickets === 0"
          :tickets="(setUpInfo3.tickets as number)"
          :bonus-tickets="isHaveBonusTickets"
        />

        <div class="d-flex flex-wrap custom-card-wrap">
          <TicketPrice
            class="custom-card rounded me-2 mb-1"
            :title="t('sharebus.ticket.price')"
            :amount="setUpInfo3.ticketPrice"
            currency="Kr"
            :info="
              setUpInfo1.route_points.return.length > 0
                ? t('sharebus.ticket.roundtrip')
                : t('sharebus.ticket.singletrip')
            "
          />
          <TicketPrice
            v-if="setUpInfo2.organizationId"
            class="custom-card rounded me-2 mb-1"
            :title="t('sharebus.ticket.bonus_per_ticket')"
            :amount="setUpInfo3.bonus"
            :should-round="false"
            currency="Kr"
            :info="
              t('sharebus.ticket.after_sold_ticket_amount', {
                passenger_goal: passengerGoal,
              })
            "
          />
        </div>
      </div>
      <TicketCounter v-if="isSharelead" />
      <ActivateDiscount
        v-if="
          !isSharelead ||
          setUpInfo3.tripCreationTicketDecision !== DECISION_RESULT.INTERMEDIATE
        "
      />
      <PriceSummary
        v-if="isSharelead"
        :price-summary="priceSummaryInfo"
        :vat-percent="busInfo.vat_percent"
        :show-payment="isSharelead"
      />

      <p
        class="error-input-color text-start mt-2"
        v-show="hasErrors && submitBtnClicked"
      >
        {{ t("form.validation.field_missing_or_invalid") }}
      </p>

      <!-- Buttons -->

      <div class="d-flex my-4 justify-content-between">
        <BaseButton
          button-class="sb-btn-lg sb-btn-secondary fw-bold rounded-pill d-flex align-items-center"
          @click="() => prevStep()"
        >
          <span class="pt-1"
            ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
          ></span>
          <span class="ms-2">{{ t("button.back") }}</span>
        </BaseButton>
        <BaseButton
          type="submit"
          button-class="sb-btn-lg sb-btn-primary rounded-pill fw-bold d-flex justify-content-center align-items-center"
          @click="
            () => {
              submitBtnClicked = true;
              !hasErrors && nextStep();
            }
          "
        >
          <template v-slot:default>
            <span>{{ buttonTextContinue }}</span>
            <span class="fw-bold ms-2"
              ><i class="fi fi-chevron-right fs-5"></i
            ></span>
          </template>
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";
import BaseRangeSlider from "@/components/common/reusable/BaseRangeSlider.vue";
import ActivateDiscount from "./TicketDiscount/ActivateDiscount.vue";
import TripInfoDetails from "./TripInfo/TripInfoDetails.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TicketPrice from "./ticketPrice/TicketPrice.vue";
import TicketCounter from "./ticketCounter/TicketCounter.vue";
import PriceSummary from "./PriceSummary/PriceSummary.vue";
import {
  useSharebusStore,
  useBusInfoStore,
  useConfigStore,
  useUserStore,
} from "@/store";
import {
  RouteStepData,
  OrganizationStepData,
  PassengerGoalAndPriceStepData,
} from "@/store/sharebus/types";
import {
  getCutPriceDiscountInfo,
  getEarlyBirdDiscountInfo,
  getNoDiscountPriceInfo,
} from "./service/executeJSONLogic";
import { DECISION_RESULT, DISCOUNT_SCHEME } from "./enums/SetUpShareBusEnum";
import { jsonLogicResult, TypeLogicBase } from "./types/JsonLogicType";
import ShareBusSetUpController from "./Controllers/ShareBusSetUpController";
import { subtractDaysFromDate, isoFormatDateTime } from "@/utils";
import { SetupSharebusConfig } from "@/store/config/types";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import PassengerGoalBonusInfo from "./PassengerGoalInfo/PassengerGoalBonusInfo.vue";
import PassengerGoalGeneralInfo from "./PassengerGoalInfo/PassengerGoalGeneralInfo.vue";

defineProps({
  prevStep: {
    type: Function,
    required: true,
  },
  nextStep: { type: Function, required: true },
});

const { t } = useI18n();
const sharebus = useSharebusStore();
const config = useConfigStore();
const busInfoStore = useBusInfoStore();
const user = useUserStore();

const setupConfig = computed<SetupSharebusConfig>(() => {
  return config.getSharebusSetupConfig;
});

const setUpInfo1 = computed<RouteStepData>(() => {
  return sharebus.getRouteStepData;
});
const setUpInfo2 = computed<OrganizationStepData>(() => {
  return sharebus.getOrganizationStepData;
});

const setUpInfo3 = computed<PassengerGoalAndPriceStepData>(() => {
  return sharebus.getPassengerGoalAndPriceStepData;
});

const isSharelead = computed(() => user.currentRole === ROLE.SHARELEAD);

const buttonTextContinue = computed(() =>
  setUpInfo3.value.grandTotalPrice && isSharelead.value
    ? t("sharebus.create_and_pay")
    : t("sharebus.create_sharebus")
);
const isHaveBonusTickets = computed(
  () => (setUpInfo3.value.tickets as number) - passengerGoal.value
);
const priceSummaryInfo = computed(() => {
  return {
    deductibleAmount: setUpInfo3.value.deductibleAmount,
    chosenDiscount: setUpInfo3.value.discountScheme,
    grandTotalPrice: setUpInfo3.value.grandTotalPrice,
    tickets: setUpInfo3.value.tickets,
    ticketPrice: setUpInfo3.value.ticketPrice,
    totalTicketPrice: setUpInfo3.value.totalTicketPrice,
  };
});
const PASSENGER_GOAL = ShareBusSetUpController.getPassengerGoalLimit;
const TICKET_NUMBER = ShareBusSetUpController.getTicketNumberLimit;

const passengerGoal = ref(
  sharebus.getPassengerGoalAndPriceStepData.passengerGoal || PASSENGER_GOAL.value.DEFAULT
);
const passengerGoalCalculable = ref(
  sharebus.getPassengerGoalAndPriceStepData.passengerGoal || PASSENGER_GOAL.value.DEFAULT
);
const busInfo = computed(() => {
  return busInfoStore.getBusInfoData;
});

const submitBtnClicked = computed({
  get: () => ShareBusSetUpController.getSubmitState(STEPS.TRIP_INFO),
  set: () => {
    ShareBusSetUpController.setSubmitState(STEPS.TRIP_INFO);
  },
});

const departureInfo = computed(() => {
  const oneway = setUpInfo1.value.route_points.oneway;
  if (!oneway.length) return { origin: '', destination: '', departureDateTime: null, arrivalDateTime: null, route_points: [] };
  return {
    origin: oneway[0].point,
    destination: oneway[oneway.length - 1].point,
    departureDateTime: oneway[0].planned_departure_time,
    arrivalDateTime: oneway[oneway.length - 1].planned_arrival_time,
    route_points: oneway,
  };
});

const returnInfo = computed(() => {
  const returnRoute = setUpInfo1.value.route_points.return;
  if (!returnRoute.length) return { origin: '', destination: '', departureDateTime: null, arrivalDateTime: null, route_points: [] };
  const oneway = setUpInfo1.value.route_points.oneway;
  return {
    origin: returnRoute[0].point,
    destination: returnRoute[returnRoute.length - 1].point,
    departureDateTime: returnRoute[0].planned_departure_time,
    arrivalDateTime: returnRoute[returnRoute.length - 1].planned_arrival_time,
    route_points: returnRoute,
  };
});

const tickets = computed(() => sharebus.getPassengerGoalAndPriceStepData.tickets as number);

const invalidSeatCountErr = ref("");

const emit = defineEmits(["complete", "incomplete"]);

const isInRange = (min: number, max: number, value: number) => {
  return min <= value && value <= max;
};

watch(
  () => passengerGoalCalculable.value,
  (value) => {
    if (!isInRange(PASSENGER_GOAL.value.MIN, PASSENGER_GOAL.value.MAX, value)) {
      invalidSeatCountErr.value = t("sharebus.ticket.invalid_ticket_cnt", {
        min: PASSENGER_GOAL.value.MIN,
        max: PASSENGER_GOAL.value.MAX,
      });
    } else invalidSeatCountErr.value = "";
  },

  {
    immediate: true,
  }
);

onMounted(() => {
  const stepThreeStore: PassengerGoalAndPriceStepData = sharebus.getPassengerGoalAndPriceStepData;

  passengerGoal.value = stepThreeStore.passengerGoal as number;

  if (
    !isInRange(
      PASSENGER_GOAL.value.MIN,
      PASSENGER_GOAL.value.MAX,
      passengerGoal.value
    ) ||
    (tickets.value > 0 &&
      !isInRange(
        TICKET_NUMBER.value.MIN,
        TICKET_NUMBER.value.MAX,
        tickets.value
      ))
  ) {
    emit("incomplete");
  } else emit("complete");
});

watch(
  () => [passengerGoalCalculable.value, tickets.value],
  (values) => {
    if (
      !isInRange(
        PASSENGER_GOAL.value.MIN,
        PASSENGER_GOAL.value.MAX,
        values[0] as number
      ) ||
      (values[1] > 0 &&
        !isInRange(TICKET_NUMBER.value.MIN, TICKET_NUMBER.value.MAX, values[1]))
    ) {
      emit("incomplete");
    } else emit("complete");

    if (
      values[0] <= PASSENGER_GOAL.value.MAX &&
      values[0] >= PASSENGER_GOAL.value.MIN
    ) {
      passengerGoal.value = values[0];
      sharebus.setPassengerGoalAndPriceStepDataSpecific("passengerGoal", values[0]);
    } else {
      passengerGoal.value = setUpInfo3.value.passengerGoal as number;
    }
  },
  {
    immediate: true,
  }
);
const watchingTicketPriceChange = computed(() => {
  return {
    discountPercentage: setUpInfo3.value.discountPercentage,
    discountScheme: setUpInfo3.value.discountScheme,
    passengerGoal: setUpInfo3.value.passengerGoal,
    tickets: setUpInfo3.value.tickets,
  };
});

const hasErrors = computed(() => {
  return (
    (user.currentRole === ROLE.SHARELEAD &&
      (invalidSeatCountErr.value ||
        setUpInfo3.value.tripCreationTicketDecision ===
          DECISION_RESULT.INTERMEDIATE)) ||
    setUpInfo3.value.tripCreationDiscountDecision === DECISION_RESULT.INTERMEDIATE
  );
});
/*
 * watching the state change, where we need to calculate
 */
watch(
  () => watchingTicketPriceChange.value,
  (value) => {
    if (value) {
      let busPrice = busInfo.value
        ? busInfo.value.total
        : busInfoStore.busData.total;
      const data = {
        bus_price: busPrice,
        passenger_goal: setUpInfo3.value.passengerGoal as number,
        discount_scheme: setUpInfo3.value.discountScheme as string,
      };
      let jsonLogicCalculated = {} as jsonLogicResult;
      let jsonLogicCalculatedNone: number = 0;

      switch (value.discountScheme) {
        case DISCOUNT_SCHEME.CUT_PRICE:
          jsonLogicCalculated = getCutPriceDiscountInfo({
            ...data,
            cut_price_discount: setUpInfo3.value.discountPercentage as number,
            club_bonus_share: setupConfig.value.ClubBonusShare,
            bus_capacity: setupConfig.value.BusCapacity,
          });
          break;
        case DISCOUNT_SCHEME.EARLY_BIRD:
          jsonLogicCalculated = getEarlyBirdDiscountInfo({
            ...data,
            early_bird_discount: setUpInfo3.value.discountPercentage as number,
            early_bird_seat_number: setupConfig.value.EarlyBirdSeatNumber,
            club_bonus_share: setupConfig.value.ClubBonusShare,
          });
          jsonLogicCalculatedNone = getNoDiscountPriceInfo({
            bus_price: data.bus_price,
            passenger_goal: data.passenger_goal,
            discount_scheme: data.discount_scheme,
          } as TypeLogicBase);
          break;
        default:
          const noDiscountPrice = getNoDiscountPriceInfo({
            bus_price: data.bus_price,
            passenger_goal: data.passenger_goal,
            discount_scheme: data.discount_scheme,
          } as TypeLogicBase);
          jsonLogicCalculated = {
            ticketPrice: noDiscountPrice,
            deductibleAmount: 0,
            bonus: 0,
          };
      }
      if (value.discountScheme == DISCOUNT_SCHEME.EARLY_BIRD) {
        sharebus.setPassengerGoalAndPriceStepDataSpecific(
          "earlyBirdTicketPrice",
          jsonLogicCalculated.ticketPrice
        );
        sharebus.setPassengerGoalAndPriceStepDataSpecific(
          "ticketPrice",
          jsonLogicCalculatedNone
        );
      } else {
        sharebus.setPassengerGoalAndPriceStepDataSpecific(
          "ticketPrice",
          jsonLogicCalculated.ticketPrice
        );
        sharebus.setPassengerGoalAndPriceStepDataSpecific("earlyBirdTicketPrice", 0);
      }

      sharebus.setPassengerGoalAndPriceStepDataSpecific("bonus", jsonLogicCalculated.bonus);

      sharebus.setPassengerGoalAndPriceStepDataSpecific(
        "deductibleAmount",
        jsonLogicCalculated.deductibleAmount || 0
      );
      let totalTicketPrice =
        (setUpInfo3.value.tickets as number) >= TICKET_NUMBER.value.MIN &&
        (setUpInfo3.value.tickets as number) <= TICKET_NUMBER.value.MAX
          ? (setUpInfo3.value.tickets as number) *
            jsonLogicCalculated.ticketPrice
          : 0;
      sharebus.setPassengerGoalAndPriceStepDataSpecific("totalTicketPrice", totalTicketPrice as number);

      let grandTotal =
        (setUpInfo3.value.totalTicketPrice as number) +
        ((jsonLogicCalculated.deductibleAmount as number) || 0);
      sharebus.setPassengerGoalAndPriceStepDataSpecific("grandTotalPrice", grandTotal as number);
    } else {
      sharebus.setPassengerGoalAndPriceStepDataSpecific("totalTicketPrice", 0);
      sharebus.setPassengerGoalAndPriceStepDataSpecific("grandTotalPrice", 0);
    }
  },
  {
    immediate: true,
  }
);

const handleKeyUpPG = (e: Event) => {
  const eventData = (e.target as HTMLInputElement).value.toString();

  if (eventData.includes(".")) {
    passengerGoalCalculable.value = Number.parseInt(eventData.split(".")[0]);
  }
};
</script>
<style lang="scss" scoped>
.discount-ticket-wrapper {
  border-radius: 4px;
  background-color: #f4f5f480;
}
.pass-goal-input {
  width: 87px;
  height: 38px;
  margin-bottom: 35px;
}
</style>
