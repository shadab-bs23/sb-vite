<template>
  <p v-if="shouldShow" class="text-start">
    {{
      t("sales.status.last_changed", {
        date_time: formatInCompanyTimezone(dateString, "dd.MM.yyyy HH:mm"),
        status,
        name: publishedBy,
      })
    }}
  </p>
</template>
<script lang="ts" setup>
import { computed, PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useSalesStore, useUserStore } from "@/store";
import { SalesEditGroup, UpdateHistory } from "@/store/salesConsole/types";
import { useCompanyTimeFormat } from "@/composables/useCompanyTimeFormat";

const { t } = useI18n();

const props = defineProps({
  tripId: {
    type: [String, Number],
    required: true,
  },
  changeKey: {
    type: String as PropType<SalesEditGroup>,
    required: true,
  },
  updateHistory: {
    type: Object as PropType<UpdateHistory>,
    required: true,
  },
});

const salesStore = useSalesStore();
const userStore = useUserStore();
const formatInCompanyTimezone = useCompanyTimeFormat();

const salesHistory = computed(() => {
  return salesStore.$state.salesEditTrip[props.tripId];
});

const editingMode = computed(() => salesStore.$state.editing_mode);

const dateString = computed(() => {
  const salesData = salesHistory.value?.update_history?.[props.changeKey];
  const propsData = props.updateHistory?.[props.changeKey];
  return salesData || propsData || "";
});

const status = computed(() => {
  const hasUnpublishedChanges =
    salesHistory.value?.update_history?.[props.changeKey];
  return hasUnpublishedChanges
    ? t("common.not_published")
    : t("common.published");
});

const publishedBy = computed(() => {
  if (!salesHistory.value) {
    const updatedBy = props.updateHistory.updated_by_ferdia_sales;
    return typeof updatedBy === "string" ? "" : updatedBy?.name || "";
  }
  return userStore.data.attributes.name;
});

const shouldShow = computed(() => {
  return editingMode.value && !!dateString.value;
});
</script>
