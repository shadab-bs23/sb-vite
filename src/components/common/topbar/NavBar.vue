<template>
  <nav class="navbar fixed-top bg-white" :class="scrolling ? 'shadow' : ''">
    <div class="w-100 d-flex justify-content-between align-items-center">
      <a class="navbar-brand" @click="handleNavigation">
        <img src="/sharebus.svg" alt="Sharebus" />
      </a>
      <ul
        class="navbar-nav my-lg-0 d-flex flex-row align-items-center"
        v-if="!isLoading"
      >
        <span class="text-nowrap me-2" v-if="!isShowAuthMenu">
          <LanguageSelector
            :is-menu-item="true"
            :is-authenticated="isShowAuthMenu"
          />
        </span>
        <li
          class="nav-item text-nowrap"
          v-if="!isShowAuthMenu && !configuration.HideUserLoginLink"
        >
          <BaseButton
            button-class="sb-btn-lg sb-btn-secondary rounded-pill py-1 px-3 fw-normal"
            aria-current="page"
            @click="routePushTag('auth', 'signin')"
            >{{ t("auth.common.sign_in") }}
            <img
              class="for-desk"
              src="/img/trip-info/right-arrow.svg"
              alt="Arrow"
            />
          </BaseButton>
        </li>
        <!--note: this comment portion is for after login navbar  -->
        <li
          class="nav-item text-nowrap for-desk px-2"
          v-if="isShowAuthMenu && user.currentRole == ROLE.SHARELEAD"
        >
          <BaseButton
            button-class="sb-btn-sharelead rounded-pill sb-btn-lg text-dark fw-bold border"
            aria-current="page"
            @click="routePush(ROUTE.SHARELEAD_BUSSES)"
          >
            {{ t("navbar.my_buses") }}
          </BaseButton>
        </li>
        <li
          class="nav-item text-nowrap for-desk px-2"
          v-if="isShowAuthMenu && user.currentRole == ROLE.PARTNER_SHARELEAD"
        >
          <BaseButton
            button-class="sb-btn-sharelead rounded-pill sb-btn-lg text-dark fw-bold border"
            aria-current="page"
            @click="routePush(ROUTE.PARTNER_SHARELEAD_TRIPS)"
          >
            {{ t("navbar.my_buses") }}
          </BaseButton>
        </li>
        <li
          class="nav-item text-nowrap for-desk px-2"
          v-if="isShowAuthMenu && user.currentRole == ROLE.JOINER"
        >
          <BaseButton
            button-class="sb-btn-lg sb-btn-joiner text-dark fw-bold  rounded-pill border"
            aria-current="page"
            @click="routePush(ROUTE.JOINER_TRIPS)"
          >
            {{ t("navbar.my_trips") }}
          </BaseButton>
        </li>
        <li class="nav-item dropdown text-nowrap ms-2" v-if="isShowAuthMenu">
          <BaseButton
            button-class="sb-btn-lg rounded-pill border-0 py-1 px-3 d-flex justify-content-between align-items-center ignore-click-navbar"
            :class="
              user.currentRole == ROLE.SHARELEAD
                ? 'btn-menu-action-sharelead'
                : 'btn-menu-action-joiner'
            "
            id="navbarScrollingDropdown"
            @click="() => dropdownShow()"
            :aria-expanded="isShowDropdown"
          >
            <img
              v-if="user.currentRole"
              :src="`/img/${roleIcon[user.currentRole]}.svg`"
              alt="sharelead"
              class="me-2"
            />
            <span
              class="fw-bold text-dark d-inline-block text-truncate truncate me-1"
              >{{ firstLastInitials(user.data.attributes.name) }}
            </span>
            <span v-if="user.currentRole" class="mx-1 fw-normal for-desk"
              >{{ roleLabel[user.currentRole] }}
            </span>
          </BaseButton>
          <ul
            class="dropdown-menu show position-absolute end-0 gray-white-bg p-0"
            aria-labelledby="navbarScrollingDropdown"
            v-if="isShowDropdown"
          >
            <li>
              <BaseButton
                button-class="dropdown-item fw-bold text-dark"
                href="#"
              >
                {{ t("navbar.select_user") }}
              </BaseButton>
            </li>
            <li class="for-desk">
              <BaseButton
                :button-class="`btn-md dropdown-item text-dark joiner-item-hover ${
                  user.currentRole === ROLE.JOINER && 'pe-none'
                }`"
                @click="setRole(ROLE.JOINER)"
              >
                <img src="/img/joiner.svg" alt="Joiner" />
                {{ t("navbar.joiner") }}
              </BaseButton>
            </li>
            <li class="for-desk" v-if="hasShareleadPermission">
              <BaseButton
                :button-class="`btn-md dropdown-item text-dark sharelead-item-hover ${
                  user.currentRole === ROLE.SHARELEAD &&
                  !user.partner.length &&
                  'pe-none'
                }`"
                @click="setRole(ROLE.SHARELEAD)"
              >
                <img src="/img/sharelead.svg" alt="sharelead" />
                {{ t("navbar.sharelead") }}
              </BaseButton>
            </li>
            <li class="for-desk" v-if="hasPartnerShareleadPermission">
              <BaseButton
                :button-class="`btn-md dropdown-item text-dark sharelead-item-hover ${
                  user.currentRole === ROLE.PARTNER_SHARELEAD &&
                  user.partner.length &&
                  'pe-none'
                }`"
                @click="setRole(ROLE.PARTNER_SHARELEAD)"
              >
                <img src="/img/sales.svg" alt="sales" />
                {{ t("navbar.sharelead") }}
              </BaseButton>
            </li>
            <li class="for-desk" v-if="hasSalesPermission">
              <BaseButton
                :button-class="`btn-md dropdown-item text-dark sharelead-item-hover ${
                  user.currentRole === ROLE.FERDIA_SALES && 'pe-none'
                }`"
                @click="setRole(ROLE.FERDIA_SALES)"
              >
                <img src="/img/sales.svg" alt="sales" /> {{ t("navbar.sales") }}
              </BaseButton>
            </li>
            <li
              class="for-mobile"
              :class="isJoinerActive && 'malibu-bg-rgba'"
              @click="setRole(ROLE.JOINER)"
            >
              <BaseButton button-class="dropdown-item joiner-item-hover">
                <img src="/img/joiner.svg" alt="Joiner" />
                <span class="text-dark"> {{ t("navbar.joiner") }}</span>
              </BaseButton>
              <ul class="inline-style-none">
                <li class="for-mobile joiner-item-hover">
                  <BaseButton
                    button-class="dropdown-item fw-bold text-dark"
                    @click="
                      () => {
                        setRole(ROLE.JOINER);
                      }
                    "
                  >
                    {{ t("navbar.my_trips") }}
                  </BaseButton>
                </li>
              </ul>
            </li>

            <li
              v-if="hasShareleadPermission"
              class="for-mobile"
              :class="isShareleadActive && 'orange-buttercup-bg-rgba'"
              @click="setRole(ROLE.SHARELEAD)"
            >
              <BaseButton
                button-class="dropdown-item text-dark sharelead-item-hover"
                href="#"
              >
                <img src="/img/sharelead.svg" alt="sharelead" />
                {{ t("navbar.sharelead") }}
              </BaseButton>
              <ul class="inline-style-none">
                <li>
                  <BaseButton
                    button-class="dropdown-item fw-bold text-dark sharelead-item-hover"
                    @click="
                      () => {
                        setRole(ROLE.SHARELEAD);
                      }
                    "
                  >
                    {{ t("navbar.my_buses") }}
                  </BaseButton>
                </li>
              </ul>
            </li>
            <li
              v-if="hasSalesPermission"
              class="for-mobile"
              :class="isSalesActive && 'orange-buttercup-bg-rgba'"
              @click="setRole(ROLE.PARTNER_SHARELEAD)"
            >
              <BaseButton
                button-class="dropdown-item text-dark sharelead-item-hover"
                href="#"
              >
                <img src="/img/sales.svg" alt="sales" />
                Sharelead
              </BaseButton>
              <ul class="inline-style-none">
                <li>
                  <BaseButton
                    button-class="dropdown-item fw-bold text-dark sharelead-item-hover"
                    @click="
                      () => {
                        setRole(ROLE.PARTNER_SHARELEAD);
                        routePush(ROUTE.PARTNER_SHARELEAD_TRIPS);
                      }
                    "
                  >
                    My buses
                  </BaseButton>
                </li>
              </ul>
            </li>
            <li
              v-if="hasSalesPermission"
              class="for-mobile"
              :class="isSalesActive && 'orange-buttercup-bg-rgba'"
              @click="setRole(ROLE.FERDIA_SALES)"
            >
              <BaseButton
                button-class="dropdown-item text-dark sharelead-item-hover"
                href="#"
              >
                <img src="/img/sales.svg" alt="sales" />
                Sales
              </BaseButton>
              <ul class="inline-style-none">
                <li>
                  <BaseButton
                    button-class="dropdown-item fw-bold text-dark sharelead-item-hover"
                    @click="
                      () => {
                        setRole(ROLE.FERDIA_SALES);
                        routePush(ROUTE.SALES_TRIPS);
                      }
                    "
                  >
                    Sales
                  </BaseButton>
                </li>
              </ul>
            </li>
            <li>
              <BaseButton
                button-class="dropdown-item text-dark"
                @click="routePushTag('user', 'profile')"
              >
                {{ t("navbar.profile") }}
              </BaseButton>
            </li>
            <li>
              <a
                class="dropdown-item text-dark"
                :href="CTA.HELP"
                target="_blank"
              >
                {{ t("navbar.help") }} <i class="fi fi-box-arrow-up-right"></i>
              </a>
            </li>
            <li>
              <button class="dropdown-item text-dark" @click="handleSignOut()">
                {{ t("navbar.logout") }}
              </button>
            </li>
          </ul>
        </li>
        <li class="nav-item ms-2" v-if="isShowAuthMenu">
          <span class="px-0 mt-2 ignore-click-navbar">
            <LanguageSelector :is-authenticated="isShowAuthMenu" />
          </span>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import {
  routePushTag,
  routePush,
  firstLastInitials,
  roleIcon,
  roleLabel,
} from "@/utils";
// note: this comment portion is for after login navbar
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore, useConfigStore } from "@/store";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { CTA, ROLE } from "@/components/common/enums/enums";
import LanguageSelector from "./LanguageSelector.vue";
import { toastWithActionable } from "@/services/toast/toast.service";
import NavController from "./controller/NavController";
import { ROUTE } from "@/router/enum/routeEnums";
import DecisionDialog from "../dialog/DecisionDialog.vue";

const { locale, t } = useI18n({ useScope: "global" });
const user = useUserStore();
const route = useRoute();

onMounted(() => {
  const currentLocale = localStorage.getItem("locale") as string;
  if (currentLocale?.length) locale.value = currentLocale;
  else {
    localStorage.setItem("locale", "en");
    locale.value = "en";
  }
});

const isShowAuthMenu = computed(() => user.isAuthenticated);
const isShowDropdown = ref(false);
const hideMenu = computed(() => NavController.getSidebarActive());

const dropdownShow = () => {
  if (hideMenu.value) {
    if (!isShowDropdown.value) {
      isShowDropdown.value = true;
      NavController.setMenuActive(true);
    }
  } else {
    isShowDropdown.value = !isShowDropdown.value;
    NavController.setMenuActive(isShowDropdown.value);
  }
};

const isJoinerActive = computed(() => user.currentRole == ROLE.JOINER);
const isShareleadActive = computed(() => user.currentRole == ROLE.SHARELEAD);
const isSalesActive = computed(() => user.currentRole == ROLE.FERDIA_SALES);

const hasSalesPermission = computed(() => user.getSalesPermission);
const hasShareleadPermission = computed(() => user.getShareleadPermission);
const hasPartnerShareleadPermission = computed(
  () => user.getPartnerShareleadPermission
);
const isLoading = computed(() => user.$state.isLoading);

const isShareleadRoute = computed(() => {
  const { name } = route;
  return (
    name === ROUTE.SHARELEAD_BUSSES ||
    name === ROUTE.SETUP_SHAREBUS ||
    name === ROUTE.PUBLISH_SHAREBUS ||
    name === ROUTE.SHARELEAD_TRIP_PAGE ||
    name === ROUTE.TRIP_MAP
  );
});

const isJoinerRoute = computed(() => {
  const { name } = route;
  return (
    name === ROUTE.JOINER_TRIPS ||
    name === ROUTE.JOINER_BOOK_TICKET ||
    name === ROUTE.JOINER_TRIP_PAGE ||
    name === ROUTE.JOINER_CANCEL_BOOKING
  );
});

const setRole = (role: string) => {
  if (
    route.name === "home" &&
    (role === ROLE.SHARELEAD || role === ROLE.JOINER)
  ) {
    roleChangeDialogAction(role, "");
  }
  if (role === ROLE.SHARELEAD && !isShareleadRoute.value) {
    roleChangeDialogAction(role, ROUTE.SHARELEAD_BUSSES);
  }
  if (role === ROLE.PARTNER_SHARELEAD) {
    roleChangeDialogAction(role, ROUTE.PARTNER_SHARELEAD_TRIPS);
  }
  if (role === ROLE.JOINER && !isJoinerRoute.value) {
    roleChangeDialogAction(role, ROUTE.JOINER_TRIPS);
  }
  if (role === ROLE.FERDIA_SALES) {
    roleChangeDialogAction(role, ROUTE.SALES_TRIPS);
  }
  dropdownShow();
};

const handleSignOut = async () => {
  await user.signOutAction().then(() => routePush(ROUTE.HOME));
  dropdownShow();
};
/*
 * handle navbar folding up
 */
window.addEventListener("click", function (event) {
  const elements = document.getElementsByClassName("ignore-click-navbar");
  const navCloseTrack = Array.prototype.some.call(elements, function (element) {
    return element.contains(event.target as HTMLInputElement);
  });

  if (!navCloseTrack) {
    if (isShowDropdown.value) {
      dropdownShow();
    }
  }
});
const config = useConfigStore();
const configuration = computed(() => config.getSharebusSetupConfig);

const handleNavigation = () => {
  if (route.name === "sales-buses" || route.name === "home") {
    return;
  }
  return routePush("home");
};
const scrolling = ref(false);
window.addEventListener("scroll", () => {
  if (window.scrollY == 0) {
    scrolling.value = false;
  } else {
    scrolling.value = true;
  }
});

watch(
  () => NavController.getSidebarActive(),
  (sidebarActive) => {
    if (sidebarActive) {
      if (isShowDropdown.value) {
        NavController.setMenuActive(false);
        isShowDropdown.value = false;
      }
    }
  }
);
const roleChangeAction = async (role: string, redirectTo: string) => {
  await user.setUserRoleAction(role);
  if (redirectTo) routePush(redirectTo);
};

const roleChangeDialogAction = (role: string, redirectTo: string) => {
  const content = {
    // Your component or JSX template
    component: DecisionDialog,
    // Props are just regular props, but these won't be reactive
    props: {
      message: t("navbar.do_change_role"),
      buttonText: t("common.yes"),
      callback: () => roleChangeAction(role, redirectTo),
    },
  };
  toastWithActionable(content);
};
</script>
<style lang="scss" scoped>
/* note: this comment portion is for after login navbar */

.navbar-brand {
  padding: 0;
}

.navbar-nav {
  margin: 0;
  .nav-item {
    margin-bottom: 0;
  }
}
.dropdown-menu {
  width: 200px;
  background: #fefffe;
  border: 1px solid #d5d6d5;

  li {
    &:hover {
      background: #a5f2c433;
      cursor: pointer;
    }
  }
}
.dropdown-item {
  &:hover {
    font-weight: bold;
  }
}

.truncate {
  max-width: 100px;
}
</style>
