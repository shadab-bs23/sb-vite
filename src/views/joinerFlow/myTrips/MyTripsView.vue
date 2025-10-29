<template>
  <div class="row">
    <div
      class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 text-start mx-auto"
    >
      <div class="row">
        <div class="text-start col-md-6 col-sm-12">
          <h2 class="text-start fw-bold mb-3">
            {{ t("sharebus.joiner.my_trips.my_trips") }}
          </h2>
        </div>
        <div class="text-start text-md-end col-md-6 col-sm-12">
          <BaseButton
            @click="routePush('home')"
            class="sb-btn-lg sb-btn-primary px-4 py-1 rounded-pill fw-400"
          >
            <div class="d-flex justify-content-center align-items-center">
              <span v-text="t('button.find_a_sharebus')"></span>
              <span class="fw-bold ms-2"
                ><i class="fi fi-arrow-right-short"></i
              ></span>
            </div>
          </BaseButton>
        </div>
      </div>
    </div>
  </div>

  <div
    class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 text-start mx-auto mt-3"
  >
    <TripFilterUI @filter-change="onFilterChange" :trip-types="tripTypes" />
  </div>

  <div v-if="joinerTripList.items.length">
    <div v-for="(trip, index) in joinerTripList.items" :key="index">
      <JoinerTrip
        :trip="trip"
        :role="ROLE.JOINER"
        :is-actionable="filterMode !== TRIP_FILTER.CANCELLED"
        @user-action="userActionCalling"
        :shouldHoverActive="filterMode !== TRIP_FILTER.CANCELLED"
      >
        <template v-slot:actionButtons>
          <BaseButton
            button-class="sb-btn-md sb-tertiary rounded-pill px-2 ms-2 d-flex p-1"
            v-if="filterMode !== TRIP_FILTER.CANCELLED"
            @click="routePushTag('Joiner-trip-page', trip.id)"
          >
            <template v-slot:default>
              <img src="/img/trip-info/right-arrow.svg" class="right-arrow" />
            </template>
          </BaseButton>
        </template>
      </JoinerTrip>
    </div>
  </div>

  <div
    class="col-sm-12 col-md-11 col-lg-11 col-xl-10 col-xxl-9 mx-auto text-start mt-3"
  >
    <NoTripsBusses
      v-if="!joinerTripList.items.length"
      class="col-sm-12 col-md-4 rounded py-4"
      :description="t('sharebus.joiner.my_trips.find_sharebus_to_join')"
      :trip-filter-type="filterMode"
    >
      <template v-slot:actionButton>
        <BaseButton
          @click="routePush('home')"
          class="px-4 py-1 my-2 rounded-pill sb-btn-lg sb-btn-primary-alt fw-400"
        >
          <div class="d-flex justify-content-center align-items-center">
            <span v-text="t('button.find_a_sharebus')"></span>
          </div>
        </BaseButton>
      </template>
    </NoTripsBusses>
  </div>
  <div
    class="p-3 col-sm-12 col-md-10 rounded bg-custom-yellow my-2 mx-auto fw-600"
    v-if="showLoadingFinished"
  >
    {{ showLoadingFinished }}
  </div>
  <BaseButton
    v-if="nextToken"
    :button-text="tripListBtnText"
    button-class="col-sm-12 col-md-3 mx-auto rounded-pill sb-btn-secondary sb-btn-lg"
    @click="handleBtnClick"
  />
</template>
<script lang="ts" setup>
import { ComputedRef, computed, inject, onMounted, ref, watch } from "vue";
import JoinerTrip from "@/components/modules/trip/SingleUserTripUpdated.vue";
import { useTripStore } from "@/store";
import { useI18n } from "vue-i18n";
import { TRIP_FILTER } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import TripFilterUI from "@/components/modules/trip/TripFilterUI.vue";
import NoTripsBusses from "@/components/modules/trip/NoTripsBusses.vue";
import { routePush, routePushTag } from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";
import { ROLE } from "@/components/common/enums/enums";
import { countryType } from "@/core/plugin/countryPlugin";
import { CountryFilter } from "@/store/trip/types";

const tripStore = useTripStore();
const { t } = useI18n();
const country = inject<ComputedRef<countryType>>("country");

const filter = ref<CountryFilter>({
  country: country?.value.countryISO as string,
});

onMounted(() => {
  tripStore.getTripListJoiner(filter.value);
});

const filterMode = ref(TRIP_FILTER.ACTIVE);

const showLoadingFinished = ref("");

const userActionCalling = (action) => {
  routePushTag("Joiner-trip-page", action.tripID);
};

const nextToken = computed(() => tripStore.getTripListNextToken);

const joinerTripList = computed(() => {
  return tripStore.getTripList;
});

const tripListBtnText = computed(
  () => nextToken.value && t("button.load_more")
);

const tripTypes = [
  {
    label: useI18n().t("status.active"),
    value: TRIP_FILTER.ACTIVE,
  },
  {
    label: useI18n().t("status.cancelled"),
    value: TRIP_FILTER.CANCELLED,
  },

  {
    label: useI18n().t("status.archived"),
    value: TRIP_FILTER.ARCHIVED,
  },
];
/*
 * when country params will change this function will call
 */
watch(
  () => country?.value.countryISO,
  (value) => {
    filter.value = {
      ...filter.value,
      country: value as string,
    };
    refetchTripList();
  }
);

const handleBtnClick = () => {
  nextToken.value && handleLoadMoreJoinerTrips();
};

const refetchTripList = () => {
  switch (filterMode.value) {
    case TRIP_FILTER.ARCHIVED:
      tripStore.getTripListJoinerArchived(filter.value);
      break;
    case TRIP_FILTER.CANCELLED:
      tripStore.getTripListJoinerCancelledBooking(filter.value);
      break;
    default:
      tripStore.getTripListJoiner(filter.value);
  }
};

const handleLoadMoreJoinerTrips = () => {
  if (tripStore.getTripListNextToken) {
    loadMoreTrips();
  } else {
    showLoadingFinished.value = "No more trips available";
    const timeOut = setTimeout(() => {
      showLoadingFinished.value = "";
      clearTimeout(timeOut);
    }, 3000);
  }
};

const loadMoreTrips = () => {
  const nextToken = tripStore.getTripListNextToken;

  switch (filterMode.value) {
    case TRIP_FILTER.ARCHIVED:
      tripStore.getTripListJoinerArchived(filter.value, nextToken);
      break;
    case TRIP_FILTER.CANCELLED:
      tripStore.getTripListJoinerCancelledBooking(filter.value);
      break;
    default:
      tripStore.getTripListJoiner(filter.value, nextToken);
  }
};
/**
 * Filter based on selection
 *
 * @param {number} value - the value based on the filter will be
 *
 */
const onFilterChange = (value: number) => {
  filterMode.value = value;
  if (value == TRIP_FILTER.ACTIVE) {
    tripStore.getTripListJoiner(filter.value);
  } else if (value == TRIP_FILTER.ARCHIVED) {
    tripStore.getTripListJoinerArchived(filter.value);
  } else {
    tripStore.getTripListJoinerCancelledBooking(filter.value);
  }
};
</script>
