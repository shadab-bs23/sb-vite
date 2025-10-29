<template>
  <div v-if="!userInfo.attributes.phone_number_verified">
    <VerifyPhone />
  </div>
  <div class="mt-2" v-if="userInfo.attributes.phone_number_verified">
    <VerifyEmail />
  </div>
</template>
<script lang="ts" setup>
import VerifyPhone from "./VerifyPhone.vue";
import VerifyEmail from "./VerifyEmail.vue";
import { useUserStore } from "@/store";
import { computed } from "vue";

const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
</script>
