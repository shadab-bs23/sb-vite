<template>
  <div>
    <div class="row">
      <div class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto">
        <div class="row">
          <div class="text-start col-sm-12 col-md-6">
            <h2 class="text-start fw-bold">
              {{ t("sharebus.my_buses.my_buses") }}
            </h2>
          </div>
          <div class="text-start text-md-end col-sm-12 col-md-6">
            <BaseButton
              @click="routePush('setup-sharebus')"
              class="sb-btn-primary sb-btn-lg px-4 py-1 my-2 rounded-pill border-0 fw-400"
            >
              <div class="d-flex justify-content-center align-items-center">
                <span v-text="t('home.set_up_a_sharebus')"></span>
                <span class="fw-bold ms-2"><i class="fi fi-plus"></i></span>
              </div>
            </BaseButton>
          </div>
        </div>
        <div class="text-start mt-1">
          <TripFilterUI @filter-change="fetchTrips" :trip-types="tripTypes" />
        </div>
      </div>
    </div>
  </div>
  <div v-for="(trip, index) in shareLeadTripList.items" :key="index">
    <MyBussesViewWrapper :trip="trip"></MyBussesViewWrapper>
  </div>
  <div
    class="mx-auto text-start col-sm-12 col-md-11 col-lg-11 col-xl-10 col-xxl-9 mx-auto"
  >
    <NoTripsBusses
      v-if="!shareLeadTripList.items.length"
      class="col-sm-12 col-md-4 rounded py-4"
      :description="t('sharebus.my_buses.no_trip_description_sharelead')"
      :trip-filter-type="filterMode"
    >
      <template v-slot:actionButton>
        <BaseButton
          @click="routePush('setup-sharebus')"
          class="px-4 py-1 my-2 rounded-pill sb-btn-lg sb-btn-primary-alt fw-400"
        >
          <div class="d-flex justify-content-center align-items-center">
            <span v-text="t('sharebus.my_buses.start_setting_up')"></span>
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
import { useTripStore } from "@/store";
import { ComputedRef, computed, inject, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TripFilterUI from "@/components/modules/trip/TripFilterUI.vue";
import { TRIP_FILTER } from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import NoTripsBusses from "@/components/modules/trip/NoTripsBusses.vue";
import { routePush } from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";
import MyBussesViewWrapper from "./MyBussesViewWrapper.vue";
import { countryType } from "@/core/plugin/countryPlugin";

const tripStore = useTripStore();
const { t } = useI18n();
const country = inject<ComputedRef<countryType>>("country");

onMounted(() => {
  tripStore.getTripListShareLead({
    event_status: { between: ["OPEN", "UNPUBLISHED"] },
    country: country?.value.countryISO as string,
  });
});

watch(
  () => country?.value.countryISO,
  () => {
    fetchTrips(filterMode.value, null);
  }
);

const shareLeadTripList = computed(() => {
  return tripStore.getTripList;
});

const tripTypes = computed(() => [
  {
    label: t("status.active"),
    value: TRIP_FILTER.ACTIVE,
  },
  {
    label: t("status.archived"),
    value: TRIP_FILTER.ARCHIVED,
  },
]);

const nextToken = computed(() => tripStore.getTripListNextToken);
const filterMode = ref(TRIP_FILTER.ACTIVE);
const fetchTrips = (
  value: number,
  nexToken: string | null = nextToken.value
) => {
  filterMode.value = value;
  let filter;
  if (value == TRIP_FILTER.ACTIVE) {
    filter = {
      event_status: { between: ["OPEN", "UNPUBLISHED"] },
      country: country?.value.countryISO as string,
    };
  } else {
    filter = {
      event_status: { eq: "CLOSED" },
      country: country?.value.countryISO as string,
    };
  }
  tripStore.getTripListShareLead(filter, nexToken);
};
const showLoadingFinished = ref("");

const tripListBtnText = computed(
  () => nextToken.value && t("button.load_more")
);
const handleBtnClick = () => {
  nextToken.value && handleLoadMoreShareLeadTrips();
};
const handleLoadMoreShareLeadTrips = () => {
  if (tripStore.getTripListNextToken) {
    fetchTrips(filterMode.value, nextToken.value);
  } else {
    showLoadingFinished.value = "No more trips available";
    const timeOut = setTimeout(() => {
      showLoadingFinished.value = "";
      clearTimeout(timeOut);
    }, 3000);
  }
};
</script>
