<template>
  <BaseLoader
    :active="loader.getLoadingStatus.isLoading"
    spinner-position="justify-content-center position-fixed"
    loader-icon="/img/logo.svg"
    :text="routeParams === 'verify-phone' ? 'Verifying' : ''"
    text-class="green-jewel"
    :overlay-background-color="
      routeParams === 'verify-phone'
        ? 'gray-white-bg'
        : 'overlay-primary-background'
    "
  />
  <NavBar />
  <div class="body-wrapper">
    <NotificationBanner v-if="shouldShowNotificationBanner" class="w-100" />
    <router-view />
  </div>
  <FooterBar />
  <CookiesConcent
    @accept-cookies="acceptConcent"
    v-if="showCookiesConcent"
    @reject-cookies="rejectConcent"
  />
</template>

<script setup lang="ts">
import BaseLoader from "@busgroup/vue3-base-loader";
import { useRoute } from "vue-router";
import { useConfigStore, useLoaderStore } from "@/store";
import NotificationBanner from "@/components/modules/home/banner/NotificationBanner.vue";
import { computed, onMounted, ref } from "vue";
import { getCookie, setCookie } from "@/core/cookies/cookies.service";

const loader = useLoaderStore();
const config = useConfigStore();
const route = useRoute();
const routeParams = computed(() => route.params.tag);
const showCookiesConcent = ref(false);

const shouldShowNotificationBanner = computed(
  () => config.getSharebusSetupConfig.ShowNotificationBanner
);
onMounted(() => {
  if (
    getCookie("user_cookie_consent_accept") == "" &&
    getCookie("user_cookie_consent_decline") == ""
  ) {
    showCookiesConcent.value = true;
  }
});
const acceptConcent = () => {
  showCookiesConcent.value = false;
  setCookie("user_cookie_consent_accept", 1, 365);
  setCookie("user_cookie_consent_decline", 1, 0);
};
const rejectConcent = () => {
  showCookiesConcent.value = false;
  setCookie("user_cookie_consent_accept", 1, 0);
  setCookie("user_cookie_consent_decline", 1, 180);
};
</script>
<style lang="scss">
.body-wrapper {
  min-height: 100vh;
  margin-top: 100px;
}
</style>
