<template>
  <BannerSection />
  <ExploreSection @onSearch="handleSearch" :reset-category="resetCategory" />
  <PublicTripAdsSection
    v-if="!isLoading"
    :is-filter-active="filtering.show.value"
    @load-more="loadMorePublicTrips"
    :filter-next-page="nextPage || undefined"
    @reset-public-sharebus-list="
      () => {
        resetCategory.toggleShowByValue(true);
        TripFilterController.resetTripFilter();
        filtering.toggleShowByValue(false);
      }
    "
  />
</template>

<script setup lang="ts">
//primevue testing code can be found in this commit: aed854a0c88464630d6c7e1fecb7fcc353ffeba3
import {
  ComputedRef,
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import BannerSection from "@/components/modules/home/BannerSection.vue";
import ExploreSection from "@/components/modules/home/ExploreSection.vue";
import { useJoinerTripStore } from "@/store";
import PublicTripAdsSection from "@/components/modules/home/PublicTripAdsSection.vue";
import { useToggle } from "@/composables/useToggle";
import TripFilterController from "@/components/modules/trip/controller/TripFilterController";
import { TripFilterUpdate } from "@/store/trip/privateTrip/types";
import { countryType } from "@/core/plugin/countryPlugin";
import { useRoute } from "vue-router";

const joinerTripStore = useJoinerTripStore();
const filtering = useToggle();
const defaultPageLimit = 25;
const country = inject<ComputedRef<countryType>>("country");
const route = useRoute();
// trip filter default state
const tripFilter = ref<TripFilterUpdate>({
  search_list: "PublicList",
  query_string: null,
  outbound_from_datetime_range: null,
  trip_type: "Ongoing",
  country: country?.value.countryISO as string,
  page: 1,
  limit: defaultPageLimit,
});
// toggle to reset category to clear the category filter
const resetCategory = useToggle();
// loading state, ensure to show loading state until data is fetched
const isLoading = ref(true);
// on mounted check if search query is present in the url, if yes then set the search query in the filter
onMounted(() => {
  if (route.query.search) {
    filtering.toggleShowByValue(true);
    TripFilterController.setTripFilter(
      "query_string",
      route.query.search as string
    );
  } else {
    handleTrips();
  }
});
// handle search from input
const handleSearch = () => {
  filtering.toggleShowByValue(true);
  handleTrips();
};
// reset category on unmounted
onUnmounted(() => {
  TripFilterController.resetTripFilter();
});
// total page calculation based on elastic search total
const totalPage = computed(() =>
  Math.ceil(
    joinerTripStore.$state.availablePublicTrips.total / tripFilter.value.limit
  )
);
// next page calculation seeing is next page available or not
const nextPage = computed({
  get: () => {
    if (
      (tripFilter.value.page as number) < totalPage.value ||
      (totalPage.value !== tripFilter.value.page && tripFilter.value.page !== 1)
    ) {
      return tripFilter.value.page + 1;
    }
    return null;
  },
  set: () => {
    tripFilter.value.page = 1;
    joinerTripStore.$state.availablePublicTrips.total = 0;
  },
});
// handle trips based on filter and also page load
const handleTrips = async () => {
  tripFilter.value.page = (nextPage.value as number) || 1;
  await joinerTripStore.getTripListForJoinerBySearch(tripFilter.value);
  isLoading.value = false;
};

/*
 * when country params will change this function will call
 */
watch(
  () => country?.value.countryISO,
  (newValue, oldValue) => {
    if (newValue != oldValue) {
      tripFilter.value.country = newValue as string;
      TripFilterController.resetTripFilter();
      handleTrips();
    }
  },
  {
    deep: true,
  }
);
// load more trips if have paginated data
const loadMorePublicTrips = () => {
  handleTrips();
};

/**
Watches for changes in the filter variable inside TripFilterController and updates the tripFilter value accordingly.
@function
@name watchTripFilter
@param {function} callback - A callback function to execute when the trip filter changes.
@returns {object} - The trip filter watcher
*/
watch(
  () => TripFilterController.getTripFilter(),
  (newFilter) => {
    tripFilter.value = {
      ...tripFilter.value,
      ...newFilter,
    };
    nextPage.value = null;
    handleTrips();
  },
  {
    deep: true,
  }
);
</script>
