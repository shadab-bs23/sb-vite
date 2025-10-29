<template>
  <div>
    <div :class="`p-2 rounded extended-light-green-bg`">
      <div class="d-flex">
        <span>
          <i class="fi fi-check-circle-fill green-jewel"></i>
        </span>
        <span class="ms-3 ship-gray">
          {{ t("sharebus.joiner.booking.your_tickets_cancelled") }}
        </span>
      </div>
    </div>

    <BaseButton
      type="button"
      button-class="border border-1 border-primary bg-white green-jewel mx-auto my-4 rounded-pill d-flex justify-content-between align-items-center fw-600 pe-4"
      @click="routePush('joiner-trips')"
    >
      <template v-slot:default>
        <span class="fw-bold ms-2"><i class="fi fi-arrow-left-short"></i></span>
        <span>Back to your trips</span>
      </template>
    </BaseButton>

    <div>
      <div
        v-if="!toggle.show.value"
        class="d-flex justify-content-between mb-2"
        @click="toggle.toggleShow"
      >
        <span class="ship-gray fw-bold">
          {{ t("sharebus.trip_page.when_money_back") }}
        </span>
        <span
          class="bg-white ms-2 px-2 rounded-pill border border-1 border-light"
          ><img src="/img/trip-info/down-arrow.svg"
        /></span>
      </div>
      <div
        v-if="toggle.show.value"
        class="d-flex justify-content-between mb-2"
        @click="toggle.toggleShow"
      >
        <span class="fw-bold ship-gray">
          {{ t("sharebus.trip_page.when_money_back") }}
        </span>
        <span
          class="extended-green-bg ms-2 px-2 rounded-pill border border-1 border-light"
          ><img src="/img/trip-info/up-arrow.svg"
        /></span>
      </div>
      <p class="text-start" v-if="toggle.show.value">
        {{ t("sharebus.trip_page.money_back_description") }}
      </p>
      <hr class="mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@busgroup/vue3-base-button";
import { routePush } from "@/utils";
import { useI18n } from "vue-i18n";
import { useToggle } from "@/composables/useToggle";

const { t } = useI18n();
const toggle = useToggle();
</script>
