<template>
  <div class="action-header">
    <div class="d-flex align-items-center me-2">
      <img v-if="isImg" :src="iconPath" :alt="altText" />
      <i v-else :class="iconPath"></i>
      <h4>{{ header }}</h4>
    </div>
    <BaseActionButton
      v-if="showEditButton"
      :label="buttonLabel"
      :icon-path="buttonIcon"
      :alt-text="buttonAltText"
      :next-route="nextRoute"
      :route-params="routeParams"
      :on-click="buttonOnClick"
    />
  </div>
</template>

<script setup lang="ts">
import BaseActionButton from "./BaseActionButton.vue";

const props = defineProps({
  header: {
    type: String,
    required: true,
  },
  isImg: {
    type: Boolean,
    default: false,
  },
  iconPath: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    required: false,
    default: "",
  },
  //required for the button
  showEditButton: {
    type: Boolean,
    default: false,
  },
  buttonLabel: {
    type: String,
    required: true,
  },
  buttonIcon: {
    type: String,
    required: true,
  },
  buttonAltText: {
    type: String,
    required: true,
  },
  buttonOnClick: {
    type: Function,
    default: null,
  },
  nextRoute: {
    type: String,
    required: true,
  },
  routeParams: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<style lang="scss" scoped>
.action-header {
  display: flex;
  align-items: center;
}
.action-header i {
  margin-right: 0.5rem;
}
.action-header h4 {
  margin: 0;
  font-weight: bold;
}
.action-header img {
  width: 30px;
  height: 20px;
  margin-right: 0.5rem;
}
</style>
