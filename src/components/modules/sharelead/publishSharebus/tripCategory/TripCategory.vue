<template>
  <div
    class="d-flex flex-wrap"
    :class="wrapperClass"
    v-if="Object.keys(categories[0])[0]"
  >
    <div
      class="d-flex flex-wrap"
      v-for="(category, idx) in categories"
      :key="idx"
    >
      <div
        @click="
          handleRadioParentClick(
            `${Object.keys(category)[0]}${idx}`,
            idx.toString(),
            TRIP_CATEGORY[Object.keys(category)[0]]
          )
        "
      >
        <div
          :id="`${Object.keys(category)[0]}${idx}`"
          class="trip-category d-flex justify-content-center align-items-center flex-grow-1"
          :class="`${categoryClass} ${
            selectedCategory === Object.keys(category)[0] ? 'active' : ''
          }`"
          @mouseover="handleMouseOver(`${Object.keys(category)[0]}${idx}`)"
          @mouseleave="
            handleMouseLeave(
              `${Object.keys(category)[0]}${idx}`,
              !!tripCategoryClickSchema[TRIP_CATEGORY[Object.keys(category)[0]]]
            )
          "
        >
          <img
            :src="
              getIconPath.find(
                (icon) => Object.keys(icon)[0] === Object.keys(category)[0]
              )?.[Object.keys(category)[0]]
            "
            :alt="
              getIconAlt.find(
                (alt) => Object.keys(alt)[0] === Object.keys(category)[0]
              )?.[Object.keys(category)[0]]
            "
            class="category-icon me-3"
            width="20"
            height="20"
          />
          <p class="mb-0">
            {{ Object.values(category)[0] }}
          </p>
        </div>
        <BaseRadio
          :id="idx"
          :value="Object.keys(category)[0]"
          modifier-class="radio-button-size d-none"
          v-model="chosenTripCategory"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import BaseRadio from "@busgroup/vue3-base-radio";
import { TRIP_CATEGORY, tripCategoryClickSchema } from "./tripCategoryEnums";
import { useConfigStore } from "@/store";
import { useI18n } from "vue-i18n";

const props = defineProps({
  wrapperClass: {
    type: String,
    required: false,
    default: "",
  },
  categoryClass: {
    type: String,
    required: false,
    default: "border border-light px-4 rounded me-2 mb-2",
  },
  clearCategory: {
    type: Boolean,
    required: false,
    default: false,
  },
  selectedCategory: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["onSelectTripCategory", "onResetCategory"]);

const { t } = useI18n();
const config = useConfigStore();
const categories = computed(() => {
  const tripEvents = config.getSharebusSetupConfig.TripEventCategoryString;
  return tripEvents.split(",").map((value) => {
    return { [value]: t(`sharebus.publish.category.${value}`) };
  });
});

const getIconPath = computed(() => {
  const tripEvents = config.getSharebusSetupConfig.TripEventCategoryString;
  return tripEvents.split(",").map((value) => {
    return { [value]: `/img/icons/category/${value}.svg` };
  });
});

const getIconAlt = computed(() => {
  const tripEvents = config.getSharebusSetupConfig.TripEventCategoryString;
  return tripEvents.split(",").map((value) => {
    return { [value]: `${value} icon` };
  });
});

onMounted(() => {
  console.log(getIconPath.value);
  console.log(getIconAlt.value);
});

const chosenTripCategory = ref(
  props.selectedCategory && props.selectedCategory.length
    ? props.selectedCategory
    : TRIP_CATEGORY.none
);

const setResetTripCategories = (setCategory: string) => {
  const tripCategoryAllEl = document.querySelectorAll(".trip-category");
  tripCategoryAllEl.forEach((tripCategoryEl) => {
    tripCategoryEl?.classList.remove("active");
  });
  tripCategoryClickSchema[TRIP_CATEGORY.sport] = 0;
  tripCategoryClickSchema[TRIP_CATEGORY.music] = 0;
  tripCategoryClickSchema[TRIP_CATEGORY.wellness] = 0;
  tripCategoryClickSchema[TRIP_CATEGORY.vacation] = 0;
  tripCategoryClickSchema[TRIP_CATEGORY.other] = 0;
  tripCategoryClickSchema[setCategory] = 1;
};

watch(
  () => props.clearCategory,
  (value) => {
    if (value) {
      chosenTripCategory.value = TRIP_CATEGORY.none;
      setResetTripCategories(chosenTripCategory.value);
      emit("onSelectTripCategory", TRIP_CATEGORY.none);
    }
  },
  {
    immediate: true,
  }
);

const handleRadioClick = (value: string) => {
  if (tripCategoryClickSchema[value] === 1) {
    chosenTripCategory.value = TRIP_CATEGORY.none;
    tripCategoryClickSchema[TRIP_CATEGORY.sport] = 0;
    tripCategoryClickSchema[TRIP_CATEGORY.music] = 0;
    tripCategoryClickSchema[TRIP_CATEGORY.wellness] = 0;
    tripCategoryClickSchema[TRIP_CATEGORY.vacation] = 0;
    tripCategoryClickSchema[TRIP_CATEGORY.other] = 0;
    emit("onResetCategory");
  } else {
    setResetTripCategories(value);
  }
  emit("onSelectTripCategory", value);
};

/**
 * Handle mouse over behaviour for a category
 * @param categoryId
 */
const handleMouseOver = (categoryId: string) => {
  const tripCategoryEl = document.getElementById(categoryId);

  tripCategoryEl?.classList.add("active");
};

/**
 * Handle mouse leave behaviour for a category
 * @param categoryId
 * @param selected
 */
const handleMouseLeave = (categoryId: string, selected: boolean) => {
  const tripCategoryEl = document.getElementById(categoryId);

  if (!selected) {
    tripCategoryEl?.classList.remove("active");
  }
};

/**
 * Handle parent radio button click.
 * @param categoryId
 * @param radioId
 * @param tripCategory
 */
const handleRadioParentClick = (
  categoryId: string,
  radioId: string,
  tripCategory: string
) => {
  const tripCategoryEl = document.getElementById(categoryId);
  const radio = document.getElementById(radioId) as HTMLInputElement;
  if (!tripCategoryClickSchema[tripCategory]) {
    radio.checked = true;
    chosenTripCategory.value = tripCategory;
    handleRadioClick(chosenTripCategory.value);
    tripCategoryEl?.classList.add("active");
  } else {
    radio.checked = false;
    chosenTripCategory.value = TRIP_CATEGORY.none;
    handleRadioClick(chosenTripCategory.value);
    tripCategoryEl?.classList.remove("active");
  }
};
</script>

<style scope lang="scss">
.trip-category {
  height: 48px;
  transition: 0.18s all ease-in-out;
  cursor: pointer;
  background-color: white;
}

.active {
  background: #0c1026;
  color: white;

  .category-icon {
    filter: brightness(0) invert(1);
  }
}

.trip-category:hover .category-icon {
  filter: brightness(0) invert(1);
}
</style>
