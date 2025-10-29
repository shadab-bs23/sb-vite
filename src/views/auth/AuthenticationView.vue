<template>
  <BaseLoader
    :active="true"
    loader-icon="/img/logo.svg"
    overlay-background-color="gray-white-bg"
  />
</template>
<script setup lang="ts">
import BaseLoader from "@busgroup/vue3-base-loader";
import { useUserStore } from "@/store";
import { checkRolePermissions, routePushTag } from "@/utils";
import { User } from "types/auth/user.type";
import { computed, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import { useRedirect } from "@/services/auth/redirect.service";
import { showToast } from "@/services/toast/toast.service";

const route = useRoute();
const user = useUserStore();
const userInfo = computed((): User => {
  return user.getUserInfo;
});

watch(
  () => userInfo.value,
  (value) => {
    if (value) {
      if (route.query && route.query.code) {
        if (!value.attributes.phone_number_verified) {
          routePushTag("auth", "create-account");
        } else {
          user.$patch({ isAuthenticated: true });

          user
            .fetchingUserInfo()
            .then(() => {
              checkRolePermissions(user.roles);
              useRedirect().redirect();
            })
            .catch((err) => showToast("error", err));
        }
      }
    }
  }
);

onBeforeMount(() => {
  if (route.query && route.query.error_description) {
    window.location.replace("/contact-us/user-deleted?support_type=auth");
  }
});
</script>
