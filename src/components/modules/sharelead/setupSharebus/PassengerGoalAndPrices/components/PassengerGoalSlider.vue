<template>
  <div class="row">
    <div class="col-12" :class="{ 'col-lg-8': showNotice }">
      <div class="mb-2">
        <h4 class="fw-600">{{ t("setup.set_passenger_goal") }}</h4>
      </div>
      <div class="d-flex mb-3">
        <input
          v-model.number="localPassengerGoal"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': invalidSeatCountErr }"
          :min="passengerGoalLimits.MIN"
          :max="dynamicPassengerGoalMax"
          :title="invalidSeatCountErr || ''"
          @keyup="handleKeyUpPG"
          style="width: 70px"
        />
      </div>
      <small class="text-danger mt-1">{{ invalidSeatCountErr }}</small>

      <div class="slider-container">
        <input
          type="range"
          v-model.number="localPassengerGoal"
          :min="passengerGoalLimits.MIN"
          :max="dynamicPassengerGoalMax"
          step="1"
          class="custom-range"
        />
        <div class="position-relative mb-1 slider-visual">
          <!-- Gray background slider track -->
          <div class="slider-track"></div>
          <!-- Green filled portion -->
          <div
            v-if="isPassengerGoalInRange"
            class="slider-fill"
            :style="{
              width: `${
                ((localPassengerGoal - passengerGoalLimits.MIN) /
                  (dynamicPassengerGoalMax - passengerGoalLimits.MIN)) *
                100
              }%`,
            }"
          ></div>
          <!-- Slider thumb with value -->
          <div
            v-if="isPassengerGoalInRange"
            class="slider-thumb"
            :style="{
              left: `calc(${
                ((localPassengerGoal - passengerGoalLimits.MIN) /
                  (dynamicPassengerGoalMax - passengerGoalLimits.MIN)) *
                100
              }% - 11px)`,
            }"
          >
            {{ localPassengerGoal }}
          </div>
        </div>
        <div class="d-flex justify-content-between mt-1">
          <span>{{ passengerGoalLimits.MIN }}</span>
          <span>{{ dynamicPassengerGoalMax }}</span>
        </div>
      </div>
      <!-- Remaining Seats Toggle Component -->
      <div class="mt-3">
        <RemainingSeatsToggle v-model="localShowAvailableSeats" />
      </div>
    </div>
    <div class="col-lg-1 d-none d-lg-block" v-if="showNotice"></div>
    <div class="col-12 col-lg-3" v-if="showNotice">
      <PassengerGoalNotice
        :passenger-goal="localPassengerGoal"
        :deadline-date="deadlineDate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import PassengerGoalNotice from "./PassengerGoalNotice.vue";
import RemainingSeatsToggle from "./RemainingSeatsToggle.vue";

const props = defineProps({
  passengerGoal: {
    type: Number,
    required: true,
  },
  busCapacity: {
    type: Number,
    required: true,
  },
  passengerGoalLimits: {
    type: Object,
    required: true,
  },
  deadlineDate: {
    type: Date,
    required: false,
    default: null,
  },
  showNotice: {
    type: Boolean,
    default: true,
  },
  isShowAvailableSeats: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "update:passengerGoal",
  "update:showAvailableSeats",
  "validationChange",
]);

const { t } = useI18n();
const invalidSeatCountErr = ref("");
const lastValidPassengerGoalForSlider = ref(props.passengerGoal);
// Use a local value for two-way binding
const localPassengerGoal = computed({
  get: () => props.passengerGoal,
  set: (value) => emit("update:passengerGoal", value),
});

const localShowAvailableSeats = computed({
  get: () => props.isShowAvailableSeats,
  set: (value) => emit("update:showAvailableSeats", value),
});

// Create a computed property for the dynamic max passenger goal
const dynamicPassengerGoalMax = computed(() => {
  // Always clamp to 999, regardless of busCapacity
  return Math.min(props.busCapacity, 999);
});

// Define the computed property isPassengerGoalInRange to check if localPassengerGoal is within the allowed slider range
const isPassengerGoalInRange = computed(() =>
  isInRange(
    props.passengerGoalLimits.MIN,
    dynamicPassengerGoalMax.value,
    localPassengerGoal.value
  )
);

// Helper function to check if a value is in range
const isInRange = (min: number, max: number, value: number) => {
  return min <= value && value <= max;
};

const handleKeyUpPG = (e: Event) => {
  const eventData = (e.target as HTMLInputElement).value.toString();

  if (eventData.includes(".")) {
    localPassengerGoal.value = Number.parseInt(eventData.split(".")[0]);
  }

  validatePassengerGoal();
};

const validatePassengerGoal = () => {
  if (
    isInRange(
      props.passengerGoalLimits.MIN,
      dynamicPassengerGoalMax.value,
      localPassengerGoal.value
    )
  ) {
    invalidSeatCountErr.value = "";
    lastValidPassengerGoalForSlider.value = localPassengerGoal.value;
    emit("validationChange", false);
  } else {
    invalidSeatCountErr.value = t("sharebus.ticket.invalid_ticket_cnt");
    emit("validationChange", true);
  }
};

// Watch for changes in validation-relevant props
watch(
  [() => localPassengerGoal.value, () => props.busCapacity],
  () => {
    validatePassengerGoal();
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.slider-container {
  max-width: 100%;
  position: relative;
}

.custom-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 20px; /* Taller for easier clicking */
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 10;
  bottom: -16px; /* Move it over the visual elements */
}

.custom-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: transparent; /* Make it invisible so our custom thumb is visible */
  cursor: pointer;
}

.custom-range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.slider-visual {
  pointer-events: none; /* Allow clicks to go through to the range input */
}

.slider-track {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 8px;
  background-color: #28a745;
  border-radius: 4px;
}

.slider-thumb {
  position: absolute;
  top: -7px;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background-color: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .slider-thumb {
    width: 36px;
    height: 22px;
    border-radius: 11px;
    font-size: 12px;
    top: -6px;
  }

  .slider-track,
  .slider-fill {
    height: 6px;
  }

  .custom-range {
    height: 16px;
  }
}
</style>
