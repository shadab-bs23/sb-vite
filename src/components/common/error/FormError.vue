<template>
  <div :class="errorClass" class="w-100" v-show="error.message">
    {{ error.message }}
  </div>
</template>

<script setup lang="ts">
import { GeneralError } from "types/errors/errors.type";
import { PropType } from "vue";

defineProps({
  errorClass: {
    type: String,
    required: false,
    default: "bg-danger text-white",
  },
  error: {
    type: Object as PropType<GeneralError>,
    required: false,
    default: null,
  },
});
</script>
