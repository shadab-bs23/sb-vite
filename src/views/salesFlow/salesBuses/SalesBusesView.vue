<template>
  <div>
    <div class="row">
      <div class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto">
        <div
          class="d-flex justify-content-between align-items-center flex-wrap"
        >
          <h2 class="text-start fw-bold mb-0">
            {{ capitalizeFirstLetterWithRegex(user.partner) }}
            {{ t("common.sharebuses") }}
          </h2>
          <BaseButton
            v-if="user.currentRole === ROLE.PARTNER_SHARELEAD"
            class="px-4 sb-btn-lg sb-btn-primary align-self-center rounded-pill fw-bolder my-1 d-flex justify-content-between align-items-center"
            @click="goToSetUpShareBus"
          >
            <template v-slot:default>
              <span>{{ t("home.set_up_a_sharebus") }}</span>
              <span class="ms-2 fw-bold"
                ><i class="fi fi-arrow-right-short"></i
              ></span>
            </template>
          </BaseButton>
        </div>
      </div>

      <div
        class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto my-1 d-flex justify-content-between align-items-center flex-wrap"
      >
        <BaseSearch
          wrapper-class="mt-2 mb-3 light-mid-gray-border col-sm-12 col-md-7"
          :place-holder-text="t(`home.search_placeholder2`)"
          :search-btn-label="t('home.search')"
          :clear-input="!showSearchResults.show.value"
          @on-search="handleSearch($event)"
        />

        <BaseDatePicker
          v-model="searchDateRange"
          :placeholder-text="t('sharebus.search_dates')"
          date-format="dd.mm.yy"
          :showButtonBar="true"
          component-class="h-lg rounded col-sm-12 col-md-4"
          :input-class="`${searchDateRangeErrMsg ? 'border-error' : ''}`"
          :selection-mode="('range' as any)"
        />
      </div>
      <div class="col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto">
        <TripFilterUI @filter-change="onFilterChange" :trip-types="tripTypes" />
      </div>
    </div>
    <div
      class="text-start fw-600 fancy-border pb-2 mb-2 col-sm-12 col-md-11 col-lg-11 col-xl-11 col-xxl-10 mx-auto mb-3"
      v-if="showSearchResults.show.value"
    >
      Search results ({{ salesTripList.items.length }})
      {{ filter.query_string ? `-${filter.query_string}` : "" }}
      {{ searchDates.length ? ` (${searchDates[0]} - ${searchDates[1]})` : "" }}
      <span @click="handleClearSearch"
        ><i class="fi fi-x-circle-fill ms-2 cursor-pointer"></i
      ></span>
    </div>
  </div>
  <div v-for="(trip, index) in salesTripList.items" :key="index">
    <SalesTrip
      :trip="trip"
      :role="ROLE.FERDIA_SALES"
      @user-action="userActionCalling"
    >
      <template v-slot:actionButtons="slotProps">
        <div
          v-if="
            trip.trip_status === TRIP_STATUS.NEW &&
            user.currentRole === ROLE.PARTNER_SHARELEAD
          "
        >
          <BaseButton
            class="sb-btn-md"
            :button-class="'sb-btn-primary fw-bold'"
            @click="publishSharebus(trip.id)"
            :button-text="t('sharebus.my_buses.publish_sharebus')"
          />

          <BaseButton
            button-class="sb-btn-danger sb-btn-md fw-bold  ms-1"
            @click="cancelShareBus(trip.id)"
            :button-text="t('sharebus.my_buses.cancel_sharebus')"
          />
        </div>
        <BaseButton
          :id="`copy-${trip.booking_reference}`"
          button-class="sb-btn-md sb-tertiary rounded-pill px-2 ms-2 d-flex p-1"
          @click="slotProps.userButtonAction(ACTION.COPY)"
        >
          <img src="/img/my-busses/copy.svg" alt="" />
        </BaseButton>
        <BaseButton
          v-if="
            !slotProps.newTripNotPublished &&
            trip.trip_status !== TRIP_STATUS.NEW
          "
          :id="`details-${trip.booking_reference}`"
          button-class="sb-btn-md sb-tertiary rounded-pill px-2 ms-2 d-flex p-1"
          @click="slotProps.userButtonAction(ACTION.DETAILS)"
        >
          <template v-slot:default>
            <img src="/img/trip-info/right-arrow.svg" class="right-arrow" />
          </template>
        </BaseButton>
      </template>
    </SalesTrip>
  </div>
  <NoTripsBusses
    v-if="!salesTripList.items.length && !nextToken"
    class="col-sm-12 col-md-11 col-lg-11 col-xl-10 col-xxl-9 text-start mx-auto mt-3 text-start"
    :title="t('sharebus.my_buses.no_active_buses')"
    description=""
  />

  <div
    class="p-3 col-sm-12 col-md-10 rounded bg-custom-yellow my-2 mx-auto fw-600"
    v-if="showLoadingFinished"
  >
    {{ showLoadingFinished }}
  </div>
  <BaseButton
    v-if="shouldPaginationOrRecentBtnShow"
    :button-text="tripListBtnText"
    button-class="col-sm-12 col-md-3 mx-auto rounded-pill sb-btn-secondary sb-btn-lg"
    @click="handleBtnClick"
  />

  <CopyTripModal
    modal-title="Copy trip"
    v-model="copyModal.show.value"
    @on-submit="handleCreateCopyTrip"
  />
</template>
<script lang="ts" setup>
import SalesTrip from "@/components/modules/trip/SingleUserTripUpdated.vue";
import {
  useSalesStore,
  useSharebusStore,
  useTripStore,
  useUserStore,
} from "@/store";
import { ComputedRef, computed, inject, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import NoTripsBusses from "@/components/modules/trip/NoTripsBusses.vue";
import BaseButton from "@busgroup/vue3-base-button";
import BaseDatePicker from "@busgroup/vue3-base-datepicker";
import BaseSearch from "@/components/common/reusable/BaseSearch.vue";
import { useToggle } from "@/composables/useToggle";
import {
  ACTION,
  FilterStatusType,
  ROLE,
} from "@/components/common/enums/enums";
import {
  getReadableDateFormat,
  isoFormatDateTime,
  routePush,
  routePushTag,
  capitalizeFirstLetterWithRegex,
} from "@/utils";
import { TripFilterUpdate } from "@/store/trip/privateTrip/types";
import {
  TRIP_FILTER,
  TRIP_STATUS,
} from "@/components/modules/sharelead/trip/tripStatus/tripStatusEnum";
import TripFilterUI from "@/components/modules/trip/TripFilterUI.vue";
import { countryType } from "@/core/plugin/countryPlugin";
import CopyTripModal from "@/components/common/dialog/CopyTripModal.vue";
import {
  dismissToast,
  showToast,
  toastWithActionable,
} from "@/services/toast/toast.service";
import DecisionDialog from "@/components/common/dialog/DecisionDialog.vue";

const tripStore = useTripStore();
const { t } = useI18n();
const copyModal = useToggle();

const country = inject<ComputedRef<countryType>>("country");
onMounted(() => {
  clearStoreTripList();
  tripStore.getSalesActiveTrips({
    country: country?.value.countryISO as string,
  });
});

watch(
  () => country?.value.countryISO,
  () => {
    handleClearSearch();
  }
);

const user = useUserStore();
const salesStore = useSalesStore();
const shareBusStore = useSharebusStore();

const showLoadingFinished = ref("");
const searchDateRange = ref();
const searchDateRangeIso = ref();
const searchDateRangeErrMsg = ref("");
const defaultPageLimit = 25;

const filter = ref<TripFilterUpdate>({
  search_list: "SalesList",
  query_string: null,
  outbound_from_datetime_range: null,
  trip_type: FilterStatusType.ACTIVE,
  country: country?.value.countryISO as string,
  page: 1,
  limit: defaultPageLimit,
});

/*
 * when country params will change this function will call
 */
watch(
  () => country?.value.countryISO,
  () => {
    handleClearSearch();
  }
);

const shouldPaginationOrRecentBtnShow = computed(
  () =>
    filter.value.query_string?.length ||
    filter.value.outbound_from_datetime_range != null ||
    nextToken.value ||
    (nextPage.value != 1 && nextPage.value != null)
);

const totalPage = computed(() =>
  Math.ceil(tripStore.$state.tripList.total / filter.value.limit)
);

const nextPage = computed({
  get: () =>
    filter.value.page < totalPage.value ||
    (totalPage.value !== filter.value.page && filter.value.page != 1)
      ? filter.value.page + 1
      : null,
  set: () => {
    filter.value.page = 1;
    tripStore.$state.tripList.total = 0;
  },
});

const tripTypes = computed(() => [
  {
    label: t("status.active"),
    value: TRIP_FILTER.ACTIVE,
  },
  {
    label: t("status.unpublished"),
    value: TRIP_FILTER.UNPUBLISHED,
  },
  {
    label: t("status.archived"),
    value: TRIP_FILTER.ARCHIVED,
  },
]);

watch(
  () => searchDateRange.value,
  (dateRange) => {
    nextPage.value = null;
    if (!dateRange) {
      if (!filter.value.query_string) {
        handleClearSearch();
      } else {
        handleSearch(searchFor.value, false);
      }
    } else if (typeof dateRange[1] !== "undefined") {
      const date1 = isoFormatDateTime(dateRange[0].toString());
      const date2 =
        isoFormatDateTime(dateRange[1].toString()).split("T")[0] + "T23:59:00Z";
      searchDateRangeIso.value = [date1, date2];
      handleSearch(searchFor.value, false);
    }
  }
);

const searchDates = computed(() => {
  if (
    filter.value.outbound_from_datetime_range &&
    filter.value.outbound_from_datetime_range.length
  ) {
    return [
      getReadableDateFormat(
        filter.value.outbound_from_datetime_range[0].toString()
      ),
      getReadableDateFormat(
        filter.value.outbound_from_datetime_range[1].toString()
      ),
    ];
  }
  return [];
});
const salesTripList = computed(() => {
  return tripStore.getTripList;
});

const userActionCalling = (action) => {
  salesStore.$reset();
  if (action.actionType === ACTION.DETAILS) {
    routePushTag("trip-sales-page", action.tripID);
  } else if (action.actionType === ACTION.COPY) {
    salesStore.$state.copy_trip = {
      id: action.tripID,
      name: action.tripName,
    };
    copyModal.toggleShow();
  }
};

const showSearchResults = useToggle();

const tripListBtnText = computed(() => {
  if (nextToken.value || (nextPage.value != 1 && nextPage.value != null)) {
    return t("button.load_more");
  }

  if (filterMode.value === TRIP_FILTER.ACTIVE) {
    return t("common.all_active_trips");
  } else if (filterMode.value === TRIP_FILTER.UNPUBLISHED) {
    return t("common.all_unpublished_trips");
  }
  return t("common.all_archived_trips");
});

const nextToken = computed(() => tripStore.getTripListNextToken);
const handleBtnClick = () => {
  if (nextToken.value) {
    handleLoadMoreSalesTrips();
  } else if (nextPage.value) {
    handleSearch(searchFor.value, false);
  } else {
    handleClearSearch();
  }
};
const searchFor = ref("");

const clearStoreTripList = () => {
  tripStore.$patch({ tripList: { items: [], nextToken: "", total: 0 } });
};
/*
 * Handles a search event.
 *
 * @param {string} searchText - The search text to use.
 */
const handleSearch = (searchText: string, initialSearch = true) => {
  if (initialSearch) nextPage.value = null;
  searchFor.value = searchText;
  filter.value.query_string = searchText || null;
  const hasSearchText = searchFor.value || null;
  const hasDateRange = searchDateRange.value || null;

  if (hasSearchText || hasDateRange) {
    filter.value.page = nextPage.value || 1;
    filter.value.trip_type = getFilterStatusType(filterMode.value);
    filter.value.query_string = hasSearchText ? searchText : null;
    filter.value.outbound_from_datetime_range = hasDateRange
      ? searchDateRangeIso.value
      : null;
    tripStore.getTripListForSalesBySearch(filter.value);
    showSearchResults.toggleShowByValue(true);
  } else {
    handleClearSearch();
  }
};

/**
 * Returns the filter status type for the given filter mode.
 *
 * @param {number} filterMode - The filter mode to use.
 * @returns {string} The filter status type.
 */
const getFilterStatusType = (filterMode: number) => {
  switch (filterMode) {
    case TRIP_FILTER.ACTIVE:
      return FilterStatusType.ACTIVE;
    case TRIP_FILTER.UNPUBLISHED:
      return FilterStatusType.UNPUBLISHED;
    default:
      return FilterStatusType.ARCHIVED;
  }
};
const handleClearSearch = () => {
  filter.value = {
    search_list: "SalesList",
    query_string: null,
    outbound_from_datetime_range: null,
    trip_type: FilterStatusType.ACTIVE,
    country: country?.value.countryISO as string,
    page: 1,
    limit: defaultPageLimit,
  };
  //need to refractor this variable
  searchFor.value = "";
  nextPage.value = null;
  searchDateRangeIso.value = null;
  showSearchResults.toggleShowByValue(false);
  if (
    searchDateRange.value == null ||
    typeof searchDateRange.value == "undefined"
  ) {
    onFilterChange(filterMode.value);
  } else {
    searchDateRange.value = null;
  }
};

const handleLoadMoreSalesTrips = () => {
  if (tripStore.getTripListNextToken) {
    loadMoreSalesTrips();
  } else {
    showLoadingFinished.value = "No more trips available";
    const timeOut = setTimeout(() => {
      showLoadingFinished.value = "";
      clearTimeout(timeOut);
    }, 3000);
  }
};

const loadMoreSalesTrips = () => {
  const nextToken = tripStore.getTripListNextToken;

  switch (filterMode.value) {
    case TRIP_FILTER.UNPUBLISHED:
      tripStore.getSalesUnpublishTrips(
        { country: country?.value.countryISO as string },
        nextToken
      );
      break;
    case TRIP_FILTER.ARCHIVED:
      tripStore.getSalesArchivedTrips(
        { country: country?.value.countryISO as string },
        nextToken
      );
      break;
    default:
      tripStore.getSalesActiveTrips(
        { country: country?.value.countryISO as string },
        nextToken
      );
  }
};

const filterMode = ref(TRIP_FILTER.ACTIVE);
const onFilterChange = (value: number) => {
  filterMode.value = value;
  if (searchDateRangeIso.value || filter.value.query_string) {
    handleSearch(filter.value.query_string as string);
  } else {
    if (value == TRIP_FILTER.ACTIVE) {
      tripStore.getSalesActiveTrips({
        country: country?.value.countryISO as string,
      });
    } else if (value === TRIP_FILTER.UNPUBLISHED) {
      tripStore.getSalesUnpublishTrips({
        country: country?.value.countryISO as string,
      });
    } else
      tripStore.getSalesArchivedTrips({
        country: country?.value.countryISO as string,
      });
  }
};
const goToSetUpShareBus = () => {
  routePush("setup-sharebus");
};

const handleCreateCopyTrip = () => {
  salesStore.copyTripAction(salesStore.getCopyTripData).then((res) => {
    if (res.status === 200) {
      showToast("success", t("sales.trip_copied_successfully"));
      routePushTag("trip-sales-page", res.trip_id);
    }
  });
};

const publishSharebus = (tripId) => {
  routePushTag("publish-sharebus", tripId);
};

const tripCancelAction = (tripId: string) => {
  shareBusStore
    .cancelSharebus(tripId)
    .then(() => {
      dismissToast("component-toast");
      tripStore.getTripListShareLead({
        event_status: { between: ["OPEN", "UNPUBLISHED"] },
        country: country?.value.countryISO as string,
      });
    })
    .catch((error) => {
      dismissToast("component-toast");
      console.log(error);
    });
};

const cancelShareBus = (tripId: string) => {
  const content = {
    // Your component or JSX template
    component: DecisionDialog,
    // Props are just regular props, but these won't be reactive
    props: {
      message: t("sharebus.trip_page.do_cancel_trip"),
      buttonText: t("button.confirm"),
      callback: () => tripCancelAction(tripId),
    },
  };
  toastWithActionable(content);
};
</script>

<style lang="scss" scoped>
.fancy-border {
  border-bottom: 2px solid;
  border-image: linear-gradient(to right, #138340 175px, #f4f5f4 0%) 1;
}
</style>
