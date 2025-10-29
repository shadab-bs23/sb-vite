<template>
  <!-- Top section for trip ads starts -->
  <section class="trip-ads-section ship-gray row" id="recentSharebuses">
    <div class="row col-sm-12 col-md-12 col-lg-10 col-xl-9 col-xxl-8 mx-auto">
      <h3
        class="fw-600 my-3"
        :class="isFilterActive ? 'text-start' : 'text-center'"
      >
        {{
          isFilterActive
            ? t("common.search_results")
            : t("sharebus.recent_sharebuses")
        }}
        {{ tripFilter.query_string ? `- ${tripFilter.query_string}` : "" }}
        {{
          searchDates.length ? ` (${searchDates[0]} - ${searchDates[1]})` : ""
        }}
      </h3>
      <div v-if="publicTripList.length === 0">
        <div class="p-3 rounded bg-custom-yellow my-2 fw-600">
          {{ t("sharebus.no_sharebuses_found") }}
        </div>
        <BaseButton
          v-if="isFilterActive"
          :button-text="tripListBtnText"
          button-class="col-sm-12 col-md-4 mx-auto rounded-pill sb-btn-lg sb-btn-secondary"
          @click="handleBtnClick"
        />
      </div>
      <div v-else>
        <TripAdPreview
          v-for="trip in publicTripList"
          :key="trip.id"
          class="col-xs-10 col-sm-10 col-md-12 mx-auto"
          :trip-data="{
            id: trip.id,
            name: trip.name,
            price: trip.minimum_possible_ticket_price,
            image_url: trip.image_url,
          }"
          :departure-info="getDepartureInfo(trip as Trip)"
          :return-info="getReturnInfo(trip as Trip)"
        />
        <div
          class="p-3 rounded bg-custom-yellow my-2 fw-600"
          v-if="showLoadingFinished"
        >
          {{ showLoadingFinished }}
        </div>
        <BaseButton
          v-if="shouldPaginationOrRecentBtnShow"
          :button-text="tripListBtnText"
          button-class="col-sm-12 col-md-4 mx-auto rounded-pill sb-btn-secondary sb-btn-lg"
          @click="handleBtnClick"
        />
      </div>
    </div>
  </section>
  <!-- Top section for trip ads ends -->
</template>

<script setup lang="ts">
import { useJoinerTripStore } from "@/store";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import TripAdPreview from "../sharelead/publishSharebus/tripPreview/TripAdPreview.vue";
import BaseButton from "@busgroup/vue3-base-button";
import { getReadableDateFormat } from "@/utils";
import TripFilterController from "../trip/controller/TripFilterController";
import UriController from "@/components/controller/UriController";
import { Trip } from "@/store/trip/privateTrip/types";
import { useTripRouteInfo } from "@/composables/useTripRouteInfo";

const props = defineProps({
  isFilterActive: {
    type: Boolean,
    required: true,
  },
  filterNextPage: {
    type: Number,
    default: null,
  },
});
const emit = defineEmits(["loadMore", "resetPublicSharebusList"]);
const { t } = useI18n();
const joinerTripStore = useJoinerTripStore();
const showLoadingFinished = ref("");
const publicTripList = computed(() => joinerTripStore.getPublicTripList);

// Use shared trip route info composable
const { getDepartureInfo, getReturnInfo } = useTripRouteInfo();

const tripListBtnText = computed(() =>
  nextToken.value || (props.filterNextPage && props.filterNextPage > 1)
    ? t("button.load_more")
    : t("button.show_recent_sharebuses")
);

const handleBtnClick = () => {
  if (nextToken.value || (props.filterNextPage && props.filterNextPage > 1)) {
    handleLoadMorePublicTrips();
  } else {
    UriController.setQuery({
      search: "",
    });
    emit("resetPublicSharebusList");
  }
};

const handleLoadMorePublicTrips = () => {
  if (nextToken.value || (props.filterNextPage && props.filterNextPage > 1)) {
    emit("loadMore");
  } else {
    showLoadingFinished.value = "No more trips available";
    const timeOut = setTimeout(() => {
      showLoadingFinished.value = "";
      clearTimeout(timeOut);
    }, 3000);
  }
};

const nextToken = computed(() => joinerTripStore.getPublicTripListNextToken);

const shouldPaginationOrRecentBtnShow = computed(() => {
  const filter = TripFilterController.getTripFilter();

  return (
    filter.query_string?.length ||
    filter.outbound_from_datetime_range != null ||
    nextToken.value ||
    (props.filterNextPage && props.filterNextPage > 1)
  );
});

const tripFilter = computed(() => TripFilterController.getTripFilter());
const searchDates = computed(() => {
  if (
    tripFilter.value.outbound_from_datetime_range &&
    tripFilter.value.outbound_from_datetime_range.length
  ) {
    return [
      getReadableDateFormat(
        tripFilter.value.outbound_from_datetime_range[0].toString()
      ),
      getReadableDateFormat(
        tripFilter.value.outbound_from_datetime_range[1].toString()
      ),
    ];
  }
  return [];
});
</script>
<style lang="scss" scoped></style>
