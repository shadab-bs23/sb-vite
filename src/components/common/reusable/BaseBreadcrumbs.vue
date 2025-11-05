<template>
  <nav :class="`${modifierClass}`" aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li>
        <span>
          <i :class="`fi fi-house-door me-1 green-jewel`"></i>
        </span>
      </li>
      <template v-for="crumb in crumbs.parent" :key="crumb">
        <li class="breadcrumb-item">
          <slot name="crumb" :crumb="crumb">
            <span :class="`${crumbClass}`">
              <a @click="handleRedirect(crumb)" :class="`${crumbLinkClass}`">
                <i :class="`${crumb.icon} me-1`"></i>
                <span :class="labelClass">{{ crumb.label }}</span>
              </a>
            </span>
          </slot>
        </li>
      </template>
      <li class="breadcrumb-item">
        <span>
          <i :class="`${crumbs.icon} me-1`"></i>
          <span :class="currentLabelClass">{{
            currentCrumbLabel || crumbs.label
          }}</span>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { routerPushHash, goBack } from "@/utils";
import { useRoute } from "vue-router";
defineProps({
  /**
   * @property {string } crumbClass - Takes a boolean to show current crumb or not from the component which implements it as a props.
   */
  showCurrentCrumb: {
    type: Boolean,
    default: true,
  },
  /**
   * @property {string } modifierClass - Takes modifier class for breadcrumb nav from the component which implements it as a props.
   */
  modifierClass: {
    type: String,
    required: false,
  },
  /**
   * @property {string } crumbClass - Takes class for single crumb item from the component which implements it as a props.
   */
  crumbClass: {
    type: String,
    required: false,
  },
  /**
   * @property {string } labelClass - Takes class for single crumb item from the component which implements it as a props.
   */
  currentCrumbLabel: {
    type: String,
    required: false,
    default: "",
  },
  /**
   * @property {string } labelClass - Takes class for single crumb item from the component which implements it as a props.
   */
  labelClass: {
    type: String,
    required: false,
  },
  /**
   * @property {string } currentLabelClass - Takes class for single crumb item from the component which implements it as a props.
   */
  currentLabelClass: {
    type: String,
    required: false,
  },

  /**
   * @property {string } crumbLinkClass - Takes class for single crumb link from the component which implements it as a props.
   */
  crumbLinkClass: {
    type: String,
    required: false,
  },
});

const route = useRoute();

const crumbs = route.meta.breadcrumb as any;

const handleRedirect = (crumb: any) => {
  if (!crumb.url.length) {
    goBack();
  } else {
    routerPushHash(crumb.url);
  }
};
</script>
