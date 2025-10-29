<template>
  <div class="row footer-wrapper">
    <footer class="px-5 pt-3 pb-4 bg-grey footer">
      <div
        class="links-wrapper d-flex justify-content-between align-items-start"
      >
        <div class="for-desk">
          <a class="navbar-brand" @click="routePush('home')">
            <img src="/sharebus.svg" />
          </a>
        </div>
        <div class="text-start">
          <a class="navbar-brand for-mobile" @click="routePush('home')">
            <img src="/sharebus.svg" />
          </a>
          <ul class="nav">
            <li class="nav-item mb-0">
              <a class="nav-link" href="/terms-and-conditions" target="_blank">
                {{ t("footer.terms_conditions") }}
              </a>
            </li>
            <li class="nav-item mb-0">
              <a class="nav-link" :href="CTA.ABOUT_SHARE_BUS" target="_blank">
                {{ t("footer.about_sharebus") }}
              </a>
            </li>
            <li class="nav-item mb-0">
              <a class="nav-link" :href="CTA.ABOUT_FERDIA" target="_blank">
                {{ t("footer.about_ferdia") }}
              </a>
            </li>
            <li class="nav-item mb-0">
              <a class="nav-link" :href="CTA.HELP" target="_blank">{{
                t("footer.help")
              }}</a>
            </li>
          </ul>
        </div>
        <button
          @click="redirect"
          class="footer-contact-us-button sb-btn-secondary sb-btn-md badge rounded-pill px-2 d-flex justify-content-center align-items-center"
        >
          <span class="me-2">{{ t("footer.contact_us") }}</span>
          <i class="fi fi-box-arrow-up-right green-jewel"></i>
        </button>
      </div>
      <div
        class="border-top d-flex flex-wrap justify-content-between align-items-center pt-3"
      >
        <a class="navbar-brand" @click="routePush('home')"> </a>
        <span class="text-muted"
          >© {{ new Date().getFullYear() }} {{ t("footer.copyright") }}</span
        >
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { CTA } from "@/components/common/enums/enums";
import { redirect, routePush } from "@/utils";
import { useI18n } from "vue-i18n";
const { t } = useI18n({ useScope: "global" });
</script>
<style lang="scss" scoped>
.footer-wrapper {
  margin-top: 100px;
  background-color: #f4f5f4;
}
</style>
