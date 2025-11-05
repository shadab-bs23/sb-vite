<template>
  <div>
    <h3 class="text-start my-4">{{ t("sharebus.membership_info") }}</h3>
    <p class="text-start mt-4 mb-2">
      <strong>{{ t("sharebus.earn_team_bonus") }}</strong>
    </p>
    <p class="text-start">
      {{ t("sharebus.earn_team_bonus_desc") }}
    </p>
    <p class="text-start mt-4 mb-1">
      {{ t("sharebus.booking_from_organization") }}
    </p>
    <div class="text-start">
      <BaseButton
        :button-class="`yes-no-btn custom-border-radius ${
          fromOrganization === DECISION_RESULT.YES
            ? 'green-jewel-bg border-end-0 text-white border-primary'
            : 'bg-white border-light'
        }`"
        :button-text="t('common.yes')"
        @click="handleYesBtnClick"
      />
      <BaseButton
        :button-class="`rounded-end yes-no-btn custom-border-radius ${
          fromOrganization === DECISION_RESULT.NO
            ? 'green-jewel-bg text-white'
            : 'bg-white  border-start-0 border-light'
        }`"
        :button-text="t('common.no')"
        @click="handleNoBtnClick"
      />
    </div>
    <p
      class="text-start py-3 ps-2 mt-2 auth-error fs-6 fw-600 mw-100 rounded"
      v-show="
        fromOrganization === DECISION_RESULT.INTERMEDIATE && submitBtnClicked
      "
    >
      {{ t("sharebus.answer_missing") }}
    </p>
    <div
      class="club-chooser-dropdown"
      v-show="fromOrganization === DECISION_RESULT.YES"
    >
      <p>{{ t("sharebus.select_club_team") }}</p>
      <div class="chooser">
        <BaseInput
          :modifier-class="`rounded ${clubOrgErr ? 'is-invalid' : ''}`"
          v-model="clubOrTeamNameVModel"
          :placeholder="t('common.search_or_select')"
          :feedback="clubOrgErr"
          feedback-class="text-danger"
          @update:modelValue="handleChange"
        />
        <i :class="dropdownIcon" @click="showDropdownResult"></i>
      </div>

      <div class="results" v-show="isDropdownResultShow">
        <p v-show="filteredOrgs.length < 1" class="text-center p-3 m-0">
          {{ t("sharebus.no_club_or_team") }}
        </p>
        <ul v-show="filteredOrgs.length > 0">
          <li
            @click="handleDropdownItemClick(item)"
            v-for="(item, idx) in filteredOrgs"
            :key="idx"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
  <p
    class="error-input-color text-start mt-2"
    v-if="clubOrgErr && submitBtnClicked"
  >
    {{ t("form.validation.field_missing_or_invalid") }}
  </p>
  <div class="d-flex my-4 justify-content-between">
    <BaseButton
      button-class="sb-btn-lg sb-btn-secondary fw-bold rounded-pill d-flex align-items-center"
      @click="() => prevStep()"
    >
      <span class="pt-1"
        ><i class="fi fi-chevron-left fs-5 icon-text-stroke green-jewel"></i
      ></span>
      <span class="ms-2">{{ t("button.back") }}</span>
    </BaseButton>
    <BaseButton
      @click="handleSubmit"
      type="submit"
      button-class="sb-btn-lg sb-btn-primary rounded-pill fw-bold d-flex justify-content-center align-items-center"
    >
      <template v-slot:default>
        <span>{{ t("auth.common.continue") }}</span>
        <span class="fw-bold ms-2"
          ><i class="fi fi-chevron-right fs-5"></i
        ></span>
      </template>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { ComputedRef, inject, onMounted, ref, watch } from "vue";
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";
import { computed } from "@vue/reactivity";
import { useI18n } from "vue-i18n";
import { useSharebusStore, useUserStore } from "@/store";
import { useOrganizationStore } from "@/store/index";
import ShareBusSetUpController from "./Controllers/ShareBusSetUpController";
import { DECISION_RESULT } from "./enums/SetUpShareBusEnum";
import { ROLE, STEPS } from "@/components/common/enums/enums";
import { showToast } from "@/services/toast/toast.service";
import { countryType } from "@/core/plugin/countryPlugin";

const props = defineProps({
  prevStep: {
    type: Function,
    required: true,
  },
  nextStep: { type: Function, required: true },
});

const organizationStore = useOrganizationStore();
const user = useUserStore();
const sharebus = useSharebusStore();
const { t } = useI18n();
const country = inject<ComputedRef<countryType>>("country");

const userDetails = computed(() => user);

const fromOrganization = computed({
  get: () => sharebus.getOrganizationStepData.fromOrganization,
  set: (value) => {
    sharebus.setOrganizationStepData({
      ...sharebus.getOrganizationStepData,
      fromOrganization: value,
    });
  },
});
const clubOrTeamNameVModel = ref("");
const organizationId = ref(sharebus.getOrganizationStepData.organizationId);
const clubOrTeamName = ref("");
const isDropdownResultShow = ref(false);
const clubOrgErr = ref("");

let dropdownIcon = ref("fi fi-chevron-down");

onMounted(() => {
  const stepTwoStore = sharebus.getOrganizationStepData;

  clubOrTeamNameVModel.value = stepTwoStore.clubOrTeam as string;
  clubOrTeamName.value = stepTwoStore.clubOrTeam as string;

  organizationStore.fetchOrganizationData({
    country: country?.value.countryISO,
  });
});

const filteredOrgs = computed(() => {
  return organizationStore.getOrganizationData.filter((val) =>
    val.name.toLowerCase().includes(clubOrTeamName.value.toLowerCase())
  );
});

const submitBtnClicked = computed({
  get: () => ShareBusSetUpController.getSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES),
  set: () => {
    ShareBusSetUpController.setSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES);
  },
});

watch(
  () => ShareBusSetUpController.getSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES),
  (value) => {
    if (value) {
      ShareBusSetUpController.setSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES, false);
      handleSubmit();
    }
  }
);

const showDropdownResult = () => {
  isDropdownResultShow.value = !isDropdownResultShow.value;
  dropdownIcon.value = isDropdownResultShow.value
    ? "selected fi fi-chevron-up"
    : "fi fi-chevron-down";
};

const handleChange = () => {
  clubOrTeamName.value = clubOrTeamNameVModel.value;
  isDropdownResultShow.value = clubOrTeamNameVModel.value.length > 0;
  dropdownIcon.value = isDropdownResultShow.value
    ? "selected fi fi-chevron-up"
    : "fi fi-chevron-down";
};

const handleDropdownItemClick = (item) => {
  // if (click.target.tagName === "LI") {
  clubOrTeamNameVModel.value = item.name;
  clubOrTeamName.value = item.name;
  clubOrgErr.value = "";
    ShareBusSetUpController.setSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES, false);
  organizationId.value = item.id;
  showDropdownResult();
  // }
};

const handleYesBtnClick = () => {
  fromOrganization.value = DECISION_RESULT.YES;
};

const handleNoBtnClick = () => {
  fromOrganization.value = DECISION_RESULT.NO;
  clubOrTeamNameVModel.value = "";
  clubOrTeamName.value = "";
  clubOrgErr.value = "";
    ShareBusSetUpController.setSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES, false);
  organizationId.value = null;
  sharebus.setOrganizationStepData({
    ...sharebus.getOrganizationStepData,
    fromOrganization: DECISION_RESULT.NO,
    clubOrTeam: clubOrTeamName.value,
    organizationId: null,
  });
};

const handleSubmit = () => {
  submitBtnClicked.value = true;

  if (
    fromOrganization.value === DECISION_RESULT.INTERMEDIATE ||
    (fromOrganization.value === DECISION_RESULT.YES && !clubOrTeamName.value)
  ) {
    clubOrgErr.value = t("sharebus.choose_club_team");
    return;
  }
  if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 6000, "top-left");
    return;
  }
    ShareBusSetUpController.setSubmitState(STEPS.PASSENGER_GOAL_AND_PRICES, false);
  sharebus.setOrganizationStepData({
    ...sharebus.getOrganizationStepData,
    fromOrganization: fromOrganization.value,
    clubOrTeam: clubOrTeamName.value,
    organizationId: Number(organizationId.value),
  });
  props.nextStep();
};
</script>

<style lang="scss" scoped>
.yes-no-btn {
  width: 62px;
  height: 35px;
}

.club-chooser-dropdown {
  margin: 30px 0;
  text-align: left;
  .chooser {
    position: relative;
    i {
      -webkit-text-stroke: 2px;
      -moz-text-stroke: 2px;
      position: absolute;
      top: 5px;
      right: 10px;
      z-index: 10;
      background: white;
      height: 25px;
      width: 25px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #d5d6d5;
      &.selected {
        border: none;
        background: #a5f2c4;
      }
    }
  }
  .results {
    max-height: 200px;
    overflow-y: scroll;
    border: 1px solid #d5d6d5;
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      width: 4px;
      background-color: #138340;
      border-radius: 8px;
    }
    ul {
      padding: 16px;
      li {
        font-size: 16px;
        line-height: 24px;
        list-style: none;
      }
    }
  }
}

.custom-border-radius {
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
