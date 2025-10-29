<template>
  <BaseCard card-class="px-2">
    <template v-slot:content>
      <div class="d-flex">
        <p class="me-2 fw-bold mb-1">{{ title }}</p>
        <!-- not needed cause we don't show any info on hover yet -->
        <!-- <span><i class="fi fi-info-circle-fill"></i></span> -->
      </div>
      <p class="text-start mb-0 d-flex align-items-center">
        <span class="fw-bold fs-3 me-1" v-if="!editMode">
          {{ limitDecimals(amount) }}
        </span>
        <BaseInput
          v-model="amountVModel"
          type="number"
          input-group-class=" me-2"
          v-if="editMode"
          :modifier-class="amountErrMsg && 'border-danger'"
        />
        <small>{{ currency }}</small>
      </p>
      <p v-if="editMode" class="text-start text-danger my-2">
        {{ amountErrMsg }}
      </p>
      <p class="text-start mb-0">
        <small>{{ info }}</small>
      </p>
    </template>
  </BaseCard>
</template>
<script setup lang="ts">
import { useAppFilters } from "@/composables/useAppFilters";
import BaseCard from "@busgroup/vue3-base-card";
import BaseInput from "@busgroup/vue3-base-input";
import { ref, watch } from "vue";
import { DECISION } from "@/components/common/enums/enums";
import { TICKET_TYPE } from "../enums/SetUpShareBusEnum";
import { useI18n } from "vue-i18n";
import { DISCOUNT_SCHEME } from "../enums/SetUpShareBusEnum";
import { limitDecimals } from "@/utils";

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: "Price",
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  shouldRound: {
    type: Boolean,
    required: false,
    default: true,
  },
  currency: {
    type: String,
    required: true,
    default: "Kr",
  },
  info: {
    type: String,
    required: false,
    default: "",
  },
  ticketType: {
    type: String,
    required: false,
    default: TICKET_TYPE.REGULAR,
  },
  editMode: {
    type: Boolean,
    required: false,
    default: false,
  },
  saveChanges: {
    type: Number,
    required: false,
    default: DECISION.INTERMEDIATE,
  },
  discountScheme: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["onSave"]);

const { t } = useI18n();

const filters = useAppFilters().filters;

const amountVModel = ref(
  props.shouldRound
    ? filters.mathFilter.getRounded(props.amount)
    : props.amount.toFixed(2)
);

const amountErrMsg = ref("");

watch(
  () => props.saveChanges,
  (decision) => {
    if (decision === DECISION.NO) {
      amountErrMsg.value = "";
      amountVModel.value = props.shouldRound
        ? filters.mathFilter.getRounded(props.amount)
        : props.amount.toFixed(2);
    } else {
      switch (true) {
        case amountVModel.value < 1 && props.ticketType == TICKET_TYPE.REGULAR:
          amountErrMsg.value = t("sharebus.ticket.invalid_ticket_price", {
            minimum: 1,
          });
          break;
        case amountVModel.value < 0 &&
          props.ticketType == TICKET_TYPE.EARLY_BIRD &&
          props.discountScheme == DISCOUNT_SCHEME.NONE:
          amountErrMsg.value = t("sharebus.ticket.invalid_ticket_price", {
            minimum: 0,
          });
          break;
        default:
          amountErrMsg.value = "";
      }
    }
    emit("onSave", {
      ticketType: props.ticketType,
      amount: amountVModel.value,
      error: amountErrMsg.value,
      scheme: props.discountScheme,
    });
  },
  {
    deep: true,
  }
);
</script>
<style lang="scss" scoped></style>
