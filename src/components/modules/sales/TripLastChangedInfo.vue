<template>
  <p>
    {{
      t("sales.status.last_changed", {
        date_time: format(new Date(dateString), "dd:MM:yyyy, hh:mm"),
        status,
        name: publishedBy,
      })
    }}
  </p>
</template>
<script lang="ts" setup>
import { format } from "date-fns";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  dateString: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  publishedBy: {
    type: String,
    default: "",
  },
});
</script>
