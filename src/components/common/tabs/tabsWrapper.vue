<template>
  <div :class="`tabs mx-2  ${tabBtnClass}`">
    <div
      :class="`d-flex justify-content-between mb-3 light-gray-bg rounded-pill px-0 ${wrapperClass}`"
    >
      <span
        v-for="tab in tabList"
        :key="tab.id"
        class="rounded-pill border-0"
        :class="selectedTab.title == tab.title ? 'active' : 'inactive'"
        @click="tabClickHandler(tab)"
      >
        {{ tab.title }}
      </span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import UriController from "@/components/controller/UriController";
import { computed, inject, provide, useSlots, watch } from "vue";

export interface Tab {
  id: number;
  title: string;
}

const props = defineProps({
  tabIndex: {
    type: Number,
    default: 0,
    required: false,
  },

  wrapperClass: {
    type: String,
    required: false,
    default: "",
  },
  tabBtnClass: {
    type: String,
    required: false,
    default: "",
  },
});

const slots = useSlots();

const handleTabChange = inject("handleTabChange") as (id: number) => void;

const tabList = computed(() => {
  if (slots && slots.default) {
    return slots.default().map((tab, id) => ({ id, title: tab.props?.title }));
  } else {
    return [];
  }
});

const selectedTab = computed({
  get: () => tabList.value[props.tabIndex],
  set: (value) => value,
});

const tabClickHandler = (tab: Tab): void => {
  UriController.setQuery({ tabindex: tab.id });
  selectedTab.value = tab;
  handleTabChange(tab.id);
};

watch(
  () => props.tabIndex,
  (newValue) => {
    selectedTab.value = tabList.value[newValue];
  }
);

provide("selectedTab", selectedTab);
</script>

<style scoped>
.active {
  padding: 5px;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 5px;
  color: white;
  background-color: #118340;
  cursor: pointer;
}

.inactive {
  padding: 5px;
  padding-left: 15px;
  padding-right: 15px;
  border-radius: 5px;
  border: 1px solid #118340;
  cursor: pointer;
}
</style>
