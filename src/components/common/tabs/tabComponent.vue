<template>
  <div v-if="title == selectedTab.title">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { Tab } from "./tabsWrapper.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
});

const selectedTab = inject("selectedTab") as Tab;
</script>
