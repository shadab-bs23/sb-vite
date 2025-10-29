<template>
  <div class="stepper-wrapper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="stepper-item bg-white"
      :class="{
        completed: currentStep > index + 1,
        active: currentStep === index + 1,
        disabled: currentStep < index + 1,
      }"
      @click="handleStepClick(index + 1)"
    >
      <div class="step-counter">{{ index + 1 }}</div>
      <div class="step-name">{{ step.label }}</div>
      <div v-if="index < steps.length - 1" class="arrow-connector">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6L15 12L9 18"
            :stroke="currentStep > index + 1 ? '#4caf50' : '#e0e0e0'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const emit = defineEmits(["previous", "next"]);

const props = defineProps({
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
  currentStep: {
    type: Number,
    required: true,
  },
  isStepValid: {
    type: Boolean,
    default: true,
  },
});

const handleStepClick = (stepNumber) => {
  // Can only navigate to completed steps or the next available step if current step is valid
  if (
    stepNumber < props.currentStep ||
    (stepNumber === props.currentStep + 1 && props.isStepValid)
  ) {
    if (stepNumber < props.currentStep) {
      emit("previous");
    } else if (stepNumber > props.currentStep) {
      emit("next");
    }
  }
};
</script>

<style scoped>
.stepper-wrapper {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 2rem;
  justify-content: flex-start;
}

.stepper-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.step-counter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f4f5f4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8d8c;
  font-weight: 400;
  margin-right: 4px;
  transition: all 0.3s ease;
}

.stepper-item.active .step-counter {
  background-color: #e5fbee; /* Light green background for active step */
  color: #000000; /* Black text for active step number */
  font-weight: bold;
}

.stepper-item.completed .step-counter {
  background-color: #f4f5f4; /* Light gray background for completed steps */
  color: #138340; /* Green text for completed step number */
}

.stepper-item.disabled .step-counter {
  background-color: #f4f5f4; /* Light gray background for future steps */
  color: #138340; /* Gray text for future step number */
}

.step-name {
  color: #999999;
  font-weight: 400;
  font-size: 14px;
  margin: 0;
  transition: all 0.3s ease;
}

.stepper-item.active .step-name {
  color: #0c1026; /* Green text for active step name from Figma */
  font-weight: 500;
}

.stepper-item.completed .step-name {
  color: #999999;
}

.arrow-connector {
  display: none; /* Hiding the arrows as per Figma design */
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  background-color: #f0f0f0;
}

.nav-button.next {
  background-color: #4caf50;
  color: white;
}
</style>
