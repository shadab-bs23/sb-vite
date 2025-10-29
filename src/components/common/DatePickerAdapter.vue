<template>
  <el-date-picker
    v-model="pickerValue"
    type="datetime"
    :format="format"
    :placeholder="placeholder"
    v-bind="$attrs"
    @change="onChange"
    :default-time="defaultDate"
    :disabled-date="disabledDate"
    :disabled-hours="disabledHours"
    :disabled-minutes="disabledMinutes"
    :clearable="clearable"
  />
</template>

<script lang="ts" setup>
import { ref, watch, inject, ComputedRef, computed } from "vue";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { isBefore, isEqual, startOfDay } from "date-fns";

const props = defineProps({
  modelValue: {
    type: [Date, String, Number],
    default: null,
  },
  format: {
    type: String,
    default: "dd.MM.yyyy HH:mm",
  },
  placeholder: {
    type: String,
    default: "",
  },
  defaultTime: {
    type: [Date, String, Number],
    default: null,
  },
  minimumDate: {
    type: [Date, String, Number],
    default: null,
  },
  maximumDate: {
    type: [Date, String, Number],
    default: null,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits([
  "update:modelValue",
  "change",
  "update:adapterTimes",
]);

const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Inject country and get timezone from it
const country = inject<ComputedRef<{ timezone?: string }>>("country");
const companyTimezone = country?.value?.timezone || "Europe/Oslo";

// Internal value for the picker, always in company timezone
const pickerValue = ref<Date | null>(null);

// Watch for external modelValue changes (UTC) and update pickerValue (company time)
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      if (pickerValue.value !== null) {
        pickerValue.value = null;
        emit("update:adapterTimes", null);
      }
      return;
    }
    const utc =
      typeof val === "string" || typeof val === "number" ? new Date(val) : val;
    const newPickerValue = utcToZonedTime(utc, companyTimezone);
    if (
      !pickerValue.value ||
      pickerValue.value.getTime() !== newPickerValue.getTime()
    ) {
      pickerValue.value = newPickerValue;
      emit("update:adapterTimes", {
        client_time_utc: utc,
        client_time: utcToZonedTime(utc, clientTimezone),
        company_time: newPickerValue,
      });
    }
  },
  { immediate: true }
);

// When user picks a date/time, treat it as company time, convert to UTC for storage
watch(pickerValue, (val, oldVal) => {
  if (val === oldVal) return;
  if (!val) {
    emit("update:modelValue", null);
    emit("update:adapterTimes", null);
    return;
  }
  // Convert from company time to UTC
  const utc = zonedTimeToUtc(val, companyTimezone);
  emit("update:modelValue", utc);
  emit("update:adapterTimes", {
    client_time_utc: utc,
    client_time: utcToZonedTime(utc, clientTimezone),
    company_time: val,
  });
});

/**
 * Converts a date from UTC to company timezone.
 *
 * This is a key utility function that handles timezone conversion for all dates
 * in the date picker component. It ensures that dates are properly displayed
 * in the company's local timezone regardless of the user's timezone.
 *
 * @param {Date|string|number|null} date - The date to convert (UTC)
 * @param {string} companyTimezone - The timezone identifier for the company
 * @returns {Date|null} - The converted date in company timezone, or null if input is null
 */
function getCompanyTime(
  date: Date | string | number | null,
  companyTimezone: string
) {
  if (!date) return null;
  const utc =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return utcToZonedTime(utc, companyTimezone);
}

/**
 * Determines which hours should be disabled in the time picker.
 *
 * This function works with the date picker to restrict hour selection
 * when a user has selected the minimum date. Hours earlier than the minimum
 * time will be disabled to prevent selecting a time before the allowed minimum.
 *
 * Note: This only applies when the selected date is the same as the minimum date.
 * For all other dates, all hours are enabled.
 *
 * @returns {number[]} - Array of hour numbers (0-23) to be disabled
 */
function getDisabledHours() {
  // Use pickerValue as the selected date (already in company time)
  const selectedCompany = pickerValue.value;
  const min = props.minimumDate
    ? getCompanyTime(props.minimumDate, companyTimezone)
    : null;
  if (!selectedCompany || !min) return [];
  // If same day as min, disable hours less than min hour
  if (
    selectedCompany.getFullYear() === min.getFullYear() &&
    selectedCompany.getMonth() === min.getMonth() &&
    selectedCompany.getDate() === min.getDate()
  ) {
    return Array.from({ length: min.getHours() }, (_, i) => i);
  }
  // For other days, enable all hours (disable none)
  return [];
}

/**
 * Determines which minutes should be disabled for a specific hour in the time picker.
 *
 * This function works with the date picker to restrict minute selection
 * when a user has selected the minimum date and the minimum hour. Minutes
 * earlier than the minimum time's minutes will be disabled.
 *
 * Note: This only applies when the selected date is the same as the minimum date
 * and the selected hour is the same as the minimum hour. For all other
 * date/hour combinations, all minutes are enabled.
 *
 * @param {number} hour - The currently selected hour (0-23)
 * @returns {number[]} - Array of minute numbers (0-59) to be disabled
 */
function getDisabledMinutes(hour: number) {
  // Use pickerValue as the selected date (already in company time)
  const selectedCompany = pickerValue.value;
  const min = props.minimumDate
    ? getCompanyTime(props.minimumDate, companyTimezone)
    : null;
  if (!selectedCompany || !min) return [];
  // If same day and hour as min, disable minutes less than min minute
  if (
    selectedCompany.getFullYear() === min.getFullYear() &&
    selectedCompany.getMonth() === min.getMonth() &&
    selectedCompany.getDate() === min.getDate() &&
    hour === min.getHours()
  ) {
    return Array.from({ length: min.getMinutes() }, (_, i) => i);
  }
  // For other times, enable all minutes (disable none)
  return [];
}

/**
 * Converts the default time value to company timezone.
 *
 * This function is used to ensure the default time shown in the picker
 * is properly displayed in the company's timezone.
 *
 * @param {Date|string|number|null} date - The default date/time to convert
 * @param {string} companyTimezone - The timezone identifier for the company
 * @returns {Date|null} - The converted default date in company timezone, or null if input is null
 */
function getDefaultTime(
  date: Date | string | number | null,
  companyTimezone: string
) {
  if (!date) return null;
  const utc =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return utcToZonedTime(utc, companyTimezone);
}

const defaultDate = computed(() =>
  getDefaultTime(props.defaultTime, companyTimezone)
);
const disabledHours = getDisabledHours;
const disabledMinutes = getDisabledMinutes;
/**
 * Determines whether a date should be disabled in the date picker.
 *
 * Date selection rules:
 * 1. ENABLED:
 *    - Exactly 1 day before the minimum date (special case)
 *    - The minimum date itself
 *    - Dates between minimum and maximum (excluding maximum)
 * 2. DISABLED:
 *    - The maximum date itself
 *    - Dates before minimum date (except the special case)
 *    - Dates after maximum date
 *
 * @param {Date} date - The date to check (in client timezone)
 * @returns {boolean} - True if the date should be disabled, false if it should be enabled
 */
const disabledDate = (date: Date): boolean => {
  // Convert and normalize dates to company time at start of day for consistent comparison
  const dateToCompare = startOfDay(utcToZonedTime(date, companyTimezone));

  // Get and normalize boundaries
  const minTime = getCompanyTime(props.minimumDate, companyTimezone);
  const min = minTime ? startOfDay(minTime) : null;

  const maxTime = getCompanyTime(props.maximumDate, companyTimezone);
  const max = maxTime ? startOfDay(maxTime) : null;

  // Define the special case date (1 day before minimum)
  const oneDayBeforeMin = min && new Date(min.getTime());
  if (oneDayBeforeMin) oneDayBeforeMin.setDate(oneDayBeforeMin.getDate() - 1);

  // Handle special cases first

  // Special case 1: Enable the date exactly 1 day before minimum
  if (min && oneDayBeforeMin && isEqual(dateToCompare, oneDayBeforeMin)) {
    return false; // Enable the date
  }

  // Special case 2: Disable the maximum date itself
  if (max && isEqual(dateToCompare, max)) {
    return true; // Disable the date
  }

  // Standard boundary checks

  // Before minimum date (excluding special case handled above)
  if (min && isBefore(dateToCompare, min)) {
    return true; // Disable
  }

  // After maximum date
  if (max && isBefore(max, dateToCompare)) {
    return true; // Disable
  }

  // All other dates are enabled
  return false;
};

function onChange(val) {
  emit("change", val);
}
</script>
