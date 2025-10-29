<template>
  <div class="row">
    <div class="col-sm-12 col-md-6">
      <div>
        <!-- Departure -->
        <p class="warning-c6-bg text-start rounded p-2">
          <span class="fs-1 fw-600">{{ totalSoldTickets }}</span>
          {{ t("common.of") }}
          <span class="fs-1 fw-600">{{ maxPax }}</span>
          {{ t("sharebus.trip_page.possible_tickets_sold") }}
        </p>
        <TripInfoDetails
          :trip-info="departureInfo"
          :trip-status="tripStatus"
          :is-disabled="shouldTripDisabled"
          class="mb-3"
        >
          <template v-slot:badge>
            <TripStatusBadges :trip-status="tripStatus" />
          </template>
          <!-- <template
            v-slot:travelStatus
            v-if="departureTripStatus === TRIP_STATUS.ONGOING"
          >
            <BaseBadge
              badge-class="rounded-pill info-ongoing-bg ship-gray fw-normal"
            >
              <template v-slot:label
                >{{ t("status.on_the_way") }}
                <img src="/img/trip-info/three-dots.svg" class="ms-2"
              /></template>
            </BaseBadge>
          </template> -->
        </TripInfoDetails>
        <p class="text-start my-4" v-if="tripStatus === TRIP_STATUS.ONGOING">
          <i class="fi fi-map-fill green-jewel me-2"></i>
          <!-- Trip slug link -->
          <router-link
            :to="`/trip/public/${route.params.tag}`"
            class="text-decoration-underline"
            target="_blank"
            >{{ t("sharebus.trip_page.show_in_map") }}
          </router-link>
          <!-- <a
            target="_blank"
            :href="tripMapLink"
            class="text-decoration-underline"
            >{{ t("sharebus.trip_page.show_in_map") }}</a
          > -->
          <i class="fi fi-box-arrow-up-right green-jewel ms-2"></i>
        </p>
        <!-- Return -->
        <TripInfoDetails
          v-if="returnInfo.departureDateTime"
          :trip-info="returnInfo"
          :is-return-trip="true"
          :trip-status="tripStatus"
          :is-disabled="shouldTripDisabled"
        >
          <!-- <template v-slot:badge>
            <TripStatusBadges :trip-status="returnTripStatus" />
          </template> -->
          <!-- <template
            v-slot:travelStatus
            v-if="departureTripStatus === TRIP_STATUS.ONGOING"
          >
            <BaseBadge
              badge-class="rounded-pill info-ongoing-bg ship-gray fw-normal"
            >
              <template v-slot:label
                >On the way
                <img src="/img/trip-info/three-dots.svg" class="ms-2"
              /></template>
            </BaseBadge>
          </template> -->
        </TripInfoDetails>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TripInfoDetails from "../../setupSharebus/TripInfo/TripInfoDetails.vue";
import TripStatusBadges from "./TripStatusBadges.vue";
import { TRIP_STATUS } from "./tripStatusEnum";
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  departureInfo: {
    type: Object,
    required: true,
  },
  returnInfo: {
    type: Object,
    required: true,
  },
  tripStatus: {
    type: String,
    required: true,
  },
  totalSoldTickets: {
    type: Number,
    required: true,
  },
  maxPax: {
    type: Number,
    required: true,
  },
});

const { t } = useI18n();

const route = useRoute();

const shouldTripDisabled = computed(() => {
  const tripStatus = props.tripStatus;
  return (
    tripStatus === TRIP_STATUS.FINISHED ||
    tripStatus === TRIP_STATUS.CANCELED_BY_ORGANIZER ||
    tripStatus === TRIP_STATUS.CANCELED_BY_FERDIA ||
    tripStatus === TRIP_STATUS.CANCELED_BY_SALES ||
    tripStatus === TRIP_STATUS.EXPIRED ||
    tripStatus === TRIP_STATUS.TERMINATED
  );
});
</script>
