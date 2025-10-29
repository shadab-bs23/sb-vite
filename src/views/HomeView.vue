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
        handleSearch();
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

const joinerTripStore = useJoinerTripStore();
const filtering = useToggle();
const defaultPageLimit = 25;
const country = inject<ComputedRef<countryType>>("country");

const tripFilter = ref<TripFilterUpdate>({
  search_list: "PublicList",
  query_string: null,
  outbound_from_datetime_range: null,
  trip_type: "Ongoing",
  country: country?.value.countryISO as string,
  page: 1,
  limit: defaultPageLimit,
});
const filterCountry = computed(() => {
  return { country: country?.value.countryISO as string };
});

const resetCategory = useToggle();

const isLoading = ref(true);

/*
 * when country params will change this function will call
 */
watch(
  () => country?.value.countryISO,
  (newValue, oldValue) => {
    if (newValue != oldValue) {
      tripFilter.value.country = newValue as string;
      TripFilterController.resetTripFilter();
      refetchTripList();
    }
  },
  {
    deep: true,
  }
);

const refetchTripList = () => {
  joinerTripStore.fetchPublicTripListForJoiner(filterCountry.value);
};
onMounted(() => {
  joinerTripStore
    .fetchPublicTripListForJoiner(filterCountry.value)
    .then((res) => {
      isLoading.value = res.loading;
    });
});
onUnmounted(() => {
  TripFilterController.resetTripFilter();
});

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

const handleSearch = () => {
  const isFilterActive = TripFilterController.getFilterActive();
  if (isFilterActive) {
    tripFilter.value.page = (nextPage.value as number) || 1;
    filtering.toggleShowByValue(true);
    joinerTripStore.getTripListForJoinerBySearch(tripFilter.value);
  } else {
    filtering.toggleShowByValue(false);
    joinerTripStore.$patch({ availablePublicTrips: { items: [], total: 0 } });
    nextPage.value = null;
    joinerTripStore.fetchPublicTripListForJoiner(filterCountry.value);
  }
};

const loadMorePublicTrips = () => {
  const nextToken = joinerTripStore.getPublicTripListNextToken;
  if (!filtering.show.value) {
    joinerTripStore.fetchPublicTripListForJoiner(
      filterCountry.value,
      nextToken
    );
  } else {
    handleSearch();
  }
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
    if (
      !tripFilter.value.query_string &&
      !tripFilter.value.outbound_from_datetime_range
    ) {
      TripFilterController.setFilterActive(false);
      filtering.toggleShowByValue(false);
      joinerTripStore
        .fetchPublicTripListForJoiner({
          country: country?.value.countryISO as string,
        })
        .then((res) => {
          isLoading.value = res.loading;
        });
    } else {
      handleSearch();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const totalPage = computed(() =>
  Math.ceil(
    joinerTripStore.$state.availablePublicTrips.total / tripFilter.value.limit
  )
);
</script>
