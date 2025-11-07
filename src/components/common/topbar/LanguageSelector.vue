<template>
  <BaseOffCanvas
    v-if="!isEmptyObject(configuration.country_iso_codes)"
    off-canvas-class="mt-100px shadow-lg border-0 text-start"
    header-class="text-start w-90 mt-3 mx-auto"
    content-class="w-90 mx-auto"
  >
    <template v-slot:closeEl>
      <BaseButton
        button-class="sb-btn-md sb-btn-secondary text-dark fw-bold w-fit-content rounded-pill d-flex align-items-center"
        @click="() => handleOffcanvasToggle(false)"
      >
        <span class="pt-1"
          ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
        ></span>
        <span class="ms-2">{{ t("button.close") }}</span>
      </BaseButton>
    </template>
    <template v-slot:triggerEl>
      <BaseButton
        button-class="sb-btn-lg sb-btn-secondary rounded-pill d-flex justify-content-center align-items-center d-flex"
        :class="`${isMenuItem ? 'ms-2' : 'language-menu-btn'}`"
        id="navbarScrollingDropdown"
      >
        <img
          :src="`/img/locales/${selectedInfo.country?.toLowerCase()}.svg`"
          class="locale-icon rounded-pill"
          alt="country"
        />
        <span class="ms-1" v-if="!isAuthenticated && !isMobile()">
          {{ selectedInfo.country }} - {{ selectedInfo.currency }}
        </span>
      </BaseButton>
    </template>

    <template v-slot:content>
      <h3>{{ t("common.country") }}</h3>
      <div>
        <p>
          <img :src="`/img/locales/${selectedCountry.flag}`" class="me-2" />
          {{ selectedCountry.name }}
        </p>
        <hr />
        <template v-if="isJoiner">
          <p
            class="green-jewel fw-600 cursor-pointer mb-3"
            v-for="(country, index) in filteredCountries"
            :key="index"
            @click="changeCountry(country)"
          >
            <img
              :src="`/img/locales/${countriesFlag[country].flag}`"
              class="me-2"
            />
            Sharebus {{ countryMap[country].name }}
            <i class="fi fi-arrow-right ms-2"></i>
          </p>
        </template>
      </div>
      <h3 class="mt-4 mb-3">{{ t("common.language") }}</h3>
      <ul
        class="locale-dropdown-menu p-0 gray-white-bg me-0 w-90"
        :class="`${isMenuItem ? '' : 'position-absolute end-0'}`"
        aria-labelledby="navbarScrollingDropdown"
        @click="handleDropdownItemClick($event)"
      >
        <li
          v-for="(locale, index) in availableLocalesFilter"
          :key="index"
          class="d-flex justify-content-start align-items-center pe-2 mb-0 mt-1 w-fit-content rounded"
          :class="getLocaleClass(locale).localeClass"
        >
          <i :class="`${getLocaleClass(locale).icon} fs-3 mx-2`"></i>
          {{ languages[locale] }}
        </li>
      </ul>
    </template>
  </BaseOffCanvas>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { countriesFlag, languages } from "@/locales";
import {
  clearDataAndRedirect,
  getObjKey,
  isEmptyObject,
  isMobile,
} from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";
import BaseOffCanvas from "../reusable/BaseOffCanvas.vue";
import UriController from "@/components/controller/UriController";
import DecisionDialog from "../dialog/DecisionDialog.vue";
import { toastWithActionable } from "@/services/toast/toast.service";
import { useRoute } from "vue-router";
import { useConfigStore, useUserStore } from "@/store";
import NavController from "./controller/NavController";
import { localStorageSetItem } from "@/core/localStorage/LocalStorage";
import { ROLE } from "../enums/enums";

defineProps({
  isMenuItem: {
    type: Boolean,
    required: false,
    default: false,
  },
  isAuthenticated: {
    type: Boolean,
    required: true,
  },
});

const route = useRoute();
const { locale, t, availableLocales } = useI18n({ useScope: "global" });
const countryMap = UriController.countryMap;
const user = useUserStore();
const config = useConfigStore();
const configuration = computed(() => config.getSharebusSetupConfig);

const selectedCountry = ref();
const query = computed(() => UriController.getQuery());

const partnerName = computed(() => user.partner);
const teqOrgsList = computed(() => config.setupSharebus.TeqOrgInfo);
const isJoiner = computed(() => user.currentRole === ROLE.JOINER);

const setSelectedCountry = (country) => {
  localStorageSetItem("country_selected", country);
  UriController.setQuery({
    country: country,
    operator: "",
  });
  selectedCountry.value = {
    name: countryMap.value[country].name,
    currency: countryMap.value[country as string],
    flag: countriesFlag[country].flag,
  };

  clearDataAndRedirect(route.name, country);
};

watch(
  [teqOrgsList, partnerName, isJoiner],
  ([teqOrgs, partner, isJoiner]) => {
    const orgInfo = teqOrgs?.[partner];

    if (!isJoiner) {
      setSelectedCountry(orgInfo.Country);
      const currentLocale = localStorage.getItem("locale");
      if (
        currentLocale &&
        currentLocale !== orgInfo.Country.toLowerCase() &&
        currentLocale !== "en"
      ) {
        locale.value = "en";
        localStorage.setItem("locale", "en");
      }
    }
  },
  { immediate: true }
);

watch(
  () => [query.value, countryMap.value],
  (value) => {
    if (!isEmptyObject(value[1])) {
      selectedCountry.value = {
        name: countryMap.value[value[0].country as string].name,
        currency: countryMap.value[value[0].country as string].currency,
        flag: countriesFlag[value[0].country as string].flag,
      };
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

const filteredCountries = computed(() => {
  return Object.keys(countryMap.value).filter(
    (country) => countryMap.value[country].name !== selectedCountry.value.name
  );
});

const selectedInfo = computed(() => {
  return {
    currency: countryMap.value[query.value.country as string].currency,
    country: query.value.country,
  };
});

const getLocaleClass = (locale: string) => {
  const currentLocale = localStorage.getItem("locale");
  return locale === currentLocale
    ? {
        localeClass:
          "green-jewel extended-light-green-bg green-jewel-border fw-bold",
        icon: "fi fi-check2",
        style: "green-jewel",
      }
    : {};
};

/**
 * persist the selected locale into local storage
 */
const handleDropdownItemClick = (click) => {
  const currentLocale = getObjKey(languages, click.target.innerText);
  localStorage.setItem("locale", currentLocale as string);
  locale.value = currentLocale as string;
};

const availableLocalesFilter = computed(() => {
  return availableLocales.filter((res) => {
    return res == query.value?.country?.toLowerCase() || res == "en";
  });
});

const changeCountry = (country: string) => {
  const content = {
    // Your component or JSX template
    component: DecisionDialog,
    // Props are just regular props, but these won't be reactive
    props: {
      message: t("common.do_change_country"),
      buttonText: t("button.confirm"),
      callback: () => {
        setSelectedCountry(country);
        locale.value = "en";
        localStorage.setItem("locale", "en");
      },
    },
  };
  toastWithActionable(content);
};

const handleOffcanvasToggle = (isOpen: boolean) => {
  if (isOpen) {
    NavController.setSidebarActive(true);
    return;
  }
  NavController.setSidebarActive(false);
};
</script>

<style scoped lang="scss">
.locale-icon {
  width: 25px;
  height: 25px;
  object-fit: cover;
}
.locale-dropdown-menu {
  li {
    height: 40px;
    color: #000;
    transition: 0.3s all ease-in-out;
    &:hover {
      cursor: pointer;
    }
  }
}

.language-menu-btn {
  width: 46px;
}
</style>
