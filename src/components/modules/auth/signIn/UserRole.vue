<template>
  <div class="py-5 mx-auto w-100 h-100">
    <div
      class="row col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6 mx-auto my-auto bg-white rounded role-container"
    >
      <div
        class="d-flex justify-content-center align-items-center flex-column py-5 user-role-selection"
      >
        <h2 class="fw-bold mb-3 w-100">{{ t("auth.sign_in.select_role") }}</h2>
        <Dropdown
          v-model="selectedRole"
          class="w-50"
          :options="userDataModel"
          optionLabel="role"
          op
        >
          <template v-slot:value="slotProps">
            <div class="text-start" v-if="slotProps.value">
              <img
                height="36"
                width="36"
                :alt="slotProps.value.role"
                :src="'/img/' + slotProps.value.icon + '.svg'"
              />
              &nbsp;
              {{ roleLabel[slotProps.value.role] }}
            </div>
          </template>
          <template v-slot:option="slotProps">
            <div class="" v-if="slotProps.option">
              <img
                height="36"
                width="36"
                :alt="slotProps.option.role"
                :src="'/img/' + slotProps.option.icon + '.svg'"
              />
              &nbsp;
              <span>{{ roleLabel[slotProps.option.role] }}</span>
            </div>
          </template>
        </Dropdown>

        <BaseButton
          @click="handleRoleSelection(selectedRole.role)"
          class="btn btn-success text-white align-self-center rounded-pill fw-bolder px-4 my-3 d-flex justify-content-between align-items-center mt-3"
        >
          <span>{{ t("auth.common.continue") }}</span>
          <span class="fw-bold"><i class="fi fi-arrow-right-short"></i></span>
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/store";
import {
  getRedirectLink,
  roleIcon,
  roleLabel,
  routePush,
  routerPushHash,
} from "@/utils";
import { ROLE } from "@/components/common/enums/enums";
import { computed, ref } from "vue";
import Dropdown from "primevue/dropdown";
import { localStorageGetItem } from "@/core/localStorage/LocalStorage";

const { t } = useI18n();
const user = useUserStore();

const currentRole = computed(() => {
  if (user.$state.roles.includes(user.currentRole)) {
    return user.currentRole;
  } else {
    return ROLE.JOINER;
  }
});

const userDataModel = computed(() => {
  const defaultRoles = [
    {
      role: ROLE.JOINER,
      icon: roleIcon[ROLE.JOINER],
    },
  ];
  const salesRole = hasSalesPermission.value
    ? [{ role: ROLE.FERDIA_SALES, icon: roleIcon[ROLE.FERDIA_SALES] }]
    : [];

  const shareleadRole = hasShareleadPermission.value
    ? [{ role: ROLE.SHARELEAD, icon: roleIcon[ROLE.SHARELEAD] }]
    : [];

  const partnerShareleadRole = hasPartnerShareleadPermission.value
    ? [{ role: ROLE.PARTNER_SHARELEAD, icon: roleIcon[ROLE.FERDIA_SALES] }]
    : [];

  return [
    ...defaultRoles,
    ...shareleadRole,
    ...partnerShareleadRole,
    ...salesRole,
  ];
});

const selectedRole = ref({
  role: currentRole.value,
  icon: roleIcon[currentRole.value],
});

const hasSalesPermission = computed(() => user.getSalesPermission);
const hasShareleadPermission = computed(() => user.getShareleadPermission);
const hasPartnerShareleadPermission = computed(
  () => user.getPartnerShareleadPermission
);

const handleRoleSelection = async (role: string) => {
  await user.setUserRoleAction(role);
  let redirectLink =
    localStorageGetItem("redirectLink") || getRedirectLink(role);

  if (redirectLink) {
    routerPushHash(redirectLink as string);
    return;
  }
  routePush("home");
};
</script>
<style lang="scss">
.user-role-selection {
  .p-dropdown-trigger-icon {
    border-radius: 25px;
    background-color: #a5f2c4;
    padding: 2px;
  }
}
</style>
