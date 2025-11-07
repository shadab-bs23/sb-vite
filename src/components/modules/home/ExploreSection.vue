<template>
  <!-- Top section for banner starts -->
  <section class="explore-section row pb-4">
    <div class="col-sm-8 col-md-10 col-lg-8 col-xl-7 mx-auto">
      <img src="/img/ellipse.svg" alt="ellipse image" class="ellipse" />
      <h2 class="fw-bold my-4">{{ t("home.find_a_sharebus") }}</h2>
      <div class="mt-2 mb-3 d-flex mx-auto h-lg">
        <BaseSearch
          wrapper-class="w-90"
          :place-holder-text="t(`home.search_placeholder`)"
          :search-btn-label="t('home.search')"
          @on-search="handleSearch"
          :query-search="route.query.search as string || ''"
          :clear-input="category || !tripFilter?.query_string"
        />

        <span
          class="cursor-pointer bg-white rounded-pill px-3 ms-2 d-flex justify-content-center align-items-center"
          @click="filterModal.toggleShow"
          ><i class="fi fi-funnel fw-bold"></i
        ></span>
        <BaseButton
          v-if="showRss"
          class="d-flex sb-btn-lg ms-2 justify-content-center align-items-center"
          @click="copyRssFeed"
        >
          <span><i class="fi fi-rss"></i></span>
          <span class="text-nowrap ms-1"> {{ linkCopiedText }}</span>
        </BaseButton>
      </div>

      <TripCategory
        wrapper-class="justify-content-center col-sm-12 col-md-12
      col-lg-12 col-xl-12 col-xxl-8 mx-auto mt-2"
        category-class="border
      border-light px-4 rounded me-2 mb-2"
        :clear-category="category.length === 0"
        @on-select-trip-category="handleTripCategorySelection"
        @on-reset-category="
          () => {
            TripFilterController.setTripFilter('query_string', null);
            category = '';
          }
        "
      />
    </div>
  </section>

  <TripFilterModal
    v-model="filterModal.show.value"
    :toggle-modal="() => filterModal.toggleShow()"
  />
</template>

<script setup lang="ts">
import { ComputedRef, computed, inject, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import TripCategory from "../sharelead/publishSharebus/tripCategory/TripCategory.vue";
import { TRIP_CATEGORY } from "../sharelead/publishSharebus/tripCategory/tripCategoryEnums";
import BaseSearch from "@/components/common/reusable/BaseSearch.vue";
import TripFilterModal from "./TripFilterModal.vue";
import { useToggle } from "@/composables/useToggle";
import TripFilterController from "../trip/controller/TripFilterController";
import BaseButton from "@busgroup/vue3-base-button";
import { countryType } from "@/core/plugin/countryPlugin";
import { environmentLink } from "@/core/http";
import { useRoute } from "vue-router";
import UriController from "@/components/controller/UriController";

const props = defineProps({
  resetCategory: {
    type: Object,
    default: () => ({}),
  },
});
const country = inject<ComputedRef<countryType>>("country");

const emit = defineEmits(["onSearch"]);
const route = useRoute();

const { t } = useI18n();
const searchText = ref("");
const category = ref("");
const filterModal = useToggle();

watch(
  () => props.resetCategory.show.value,
  (resetCat) => {
    if (resetCat) {
      category.value = "";
      searchText.value = "";
      props.resetCategory.toggleShowByValue(false);
    }
  }
);
const tripFilter = computed(() => TripFilterController.getTripFilter());
const showRss = computed(
  () =>
    searchText.value ||
    tripFilter.value?.outbound_from_datetime_range ||
    category.value
);

const handleSearch = (searchVal: string) => {
  UriController.setQuery({
    search: searchVal,
  });
  searchText.value = searchVal;
  category.value = "";
  emit("onSearch", searchText.value);
};

const handleTripCategorySelection = (selectedCategory: string) => {
  if (selectedCategory !== TRIP_CATEGORY.none) {
    searchText.value = "";
    category.value = selectedCategory;
    TripFilterController.setTripFilter("query_string", selectedCategory);
    return;
  }
};
const linkCopiedText = ref(t("common.copy_rss"));

/**
 * Generating the link based on environment
 */
const linkToShare = computed(() => {
  const dateTimeParams = tripFilter.value.outbound_from_datetime_range
    ? `&outbound_start_date=${tripFilter.value.outbound_from_datetime_range[0]}&outbound_end_date=${tripFilter.value.outbound_from_datetime_range[1]}`
    : "";

  const searchParam = searchText.value ? `&search=${searchText.value}` : "";
  const categoryParam = category.value ? `&search=${category.value}` : "";

  return `${environmentLink[process.env.NODE_ENV as string]}/rss-feed?country=${
    country?.value.countryISO as string
  }${searchParam || categoryParam}${dateTimeParams}`;
});
/**
 * copy action
 */
const copyRssFeed = () => {
  linkCopiedText.value = t("sharebus.trip_page.link_copied");
  setTimeout(function () {
    linkCopiedText.value = t("common.copy_rss");
  }, 1000);
  navigator.clipboard.writeText(linkToShare.value);
};
</script>
<style lang="scss" scoped>
.explore-section {
  background-color: #f4f5f4;
  position: relative;
  .ellipse {
    position: absolute;
    top: -12px;
  }
  .search {
    width: 50%;
  }
}
</style>
