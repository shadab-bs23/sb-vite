<template>
  <div
    class="share-link light-gray-bg ship-gray d-flex flex-column justify-content-between p-4"
  >
    <p class="fw-600 fs-2">{{ t("sharebus.trip_page.invite_people") }}</p>
    <img src="/img/invite-bus.svg" />
    <BaseButton
      button-class="sb-btn-lg sb-btn-primary rounded-pill px-4 col-md-10 col-xxl-8 col-sm-12 align-self-center d-flex justify-content-center align-items-center"
      @click="copyBookingLink"
    >
      <template v-slot:default>
        <span><i class="fs-3 fi fi-link-45deg"></i></span>
        <span class="ms-2">{{ linkCopiedText }}</span>
      </template>
    </BaseButton>
  </div>
</template>
<script lang="ts" setup>
import { environmentLink } from "@/core/http";
import { countryType } from "@/core/plugin/countryPlugin";
import BaseButton from "@busgroup/vue3-base-button";
import { ComputedRef, computed, inject, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  tripId: {
    type: String,
    required: true,
  },
});
const country = inject<ComputedRef<countryType>>("country");
const countryParam = computed(() => `?country=${country?.value.countryISO}`);

const linkCopiedText = ref(t("sharebus.trip_page.copy_booking_link"));
const linkToShare = computed(
  () =>
    `${environmentLink[import.meta.env.MODE as string]}/social-share/${
      props.tripId
    }${countryParam.value}`
);
const copyBookingLink = () => {
  linkCopiedText.value = t("sharebus.trip_page.link_copied");
  setTimeout(function () {
    linkCopiedText.value = t("sharebus.trip_page.copy_booking_link");
  }, 1000);
  navigator.clipboard.writeText(linkToShare.value);
};
</script>
<style lang="scss">
.share-link {
  height: 400px;
  img {
    height: 220px;
  }
}
</style>
