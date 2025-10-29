<template>
  <div class="setting-section mb-4">
    <div class="mb-2">
      <h4 class="fw-600">{{ t("setup.set_max_bus_capacity") }}</h4>
    </div>
    <div class="d-flex align-items-center">
      <input
        v-model.number="localBusCapacity"
        type="number"
        class="form-control form-control-sm me-2"
        :class="{ 'is-invalid': invalidBusCapacityErr }"
        min="1"
        max="999"
        style="width: 70px"
        @input="handleBusCapacityInput"
        :title="invalidBusCapacityErr || ''"
      />
    </div>
    <small class="text-danger mt-1">{{ invalidBusCapacityErr }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  busCapacity: {
    type: Number,
    required: true,
  },
  busCapacityLimits: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:busCapacity", "validationChange"]);

const { t } = useI18n();
const invalidBusCapacityErr = ref("");

// Use a local value for two-way binding
const localBusCapacity = computed({
  get: () => props.busCapacity,
  set: (value) => emit("update:busCapacity", value),
});

const handleBusCapacityInput = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value);
  if (value < 1 || value > 999 || isNaN(value)) {
    invalidBusCapacityErr.value = t("error.bus_capacity_invalid_with_range", {
      min: props.busCapacityLimits.MIN,
      max: props.busCapacityLimits.MAX,
    });
  } else {
    invalidBusCapacityErr.value = "";
  }

  // Prevent negative values
  if (value < 0) {
    localBusCapacity.value = 1;
  }

  // Emit validation status
  emit("validationChange", !!invalidBusCapacityErr.value);
};

// Watch for external validation requests
watch(
  () => invalidBusCapacityErr.value,
  (error) => {
    emit("validationChange", !!error);
  }
);
</script>
