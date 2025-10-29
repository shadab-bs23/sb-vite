<template>
  <div class="rounded border joiner-booking-summary ship-gray text-start">
    <slot name="title"></slot>
    <ul>
      <li v-if="tickets.earlyBirdTickets.price > 0">
        <div
          class="d-flex justify-content-between"
          v-if="tickets.earlyBirdTickets.count > 0"
        >
          <span>
            {{ tickets.earlyBirdTickets.count }} x
            {{
              splitAndGetFirstElement(currentTrip?.outbound_from as string, ",")
            }}
            -
            {{
              splitAndGetFirstElement(currentTrip?.outbound_to as string, ",")
            }}
          </span>
          <span>{{ tickets.earlyBirdTickets.price }},- </span>
        </div>
        <div class="mt-2">
          <span class="ms-3"
            >{{ t("sharebus.price_summary.early_bird_tickets") }}
          </span>
        </div>
      </li>
      <li v-if="tickets.regularTickets.price > 0">
        <div
          class="d-flex justify-content-between"
          v-if="tickets.regularTickets.count > 0"
        >
          <span>
            {{ tickets.regularTickets.count }} x
            {{
              splitAndGetFirstElement(currentTrip?.outbound_from as string, ",")
            }}
            -
            {{
              splitAndGetFirstElement(currentTrip?.outbound_to as string, ",")
            }}
          </span>
          <span>{{ tickets.regularTickets.price }},-</span>
        </div>
        <div class="mt-2">
          <span class="ms-3"
            >{{ t("sharebus.price_summary.regular_ticket") }}
          </span>
        </div>
      </li>
    </ul>
    <span><hr /></span>
    <ToogleTripInfoWrapper
      :is-horizontal="false"
      :is-share-lead-originated="notGuestShow"
    />

    <hr class="total-payment-line" v-if="total" />
    <ul v-if="total" class="py-0">
      <li class="d-flex justify-content-between align-items-center">
        <span class="ship-gray">
          <strong>
            {{ t("sharebus.price_summary.total_payment") }}</strong
          ></span
        >
        <span class="ship-gray"
          ><small>Kr</small> &nbsp;
          <span class="fw-600 fs-2">{{ total }},-</span></span
        >
      </li>
    </ul>
    <slot name="other_info"></slot>
  </div>
</template>
<script lang="ts" setup>
import { PropType } from "vue";
import { PublicTrip } from "@/store/trip/joiner/types";
import ToogleTripInfoWrapper from "@/components/modules/trip/ToogleTripInfoWrapper.vue";
import { useI18n } from "vue-i18n";
import { splitAndGetFirstElement } from "@/utils";
import { Trip } from "@/store/trip/privateTrip/types";

const { t } = useI18n();
defineProps({
  currentTrip: {
    type: Object as PropType<PublicTrip | Trip>,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  tickets: {
    type: Object,
    required: true,
  },
  notGuestShow: {
    type: Boolean,
    default: false,
  },
});
</script>
