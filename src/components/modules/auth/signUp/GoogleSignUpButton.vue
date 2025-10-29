<template>
  <div>
    <BaseButton
      button-class="rounded-pill custom-class-google-button sb-btn-primary-alt sb-btn-lg  fw-bold"
      :button-text="title"
      @click="handleGoogleSignUp"
    />
  </div>
</template>
<script lang="ts" setup>
import BaseButton from "@busgroup/vue3-base-button";
import { useUserStore } from "@/store/index";

defineProps({
  title: {
    type: String,
    required: false,
    default: "Google sign up",
  },
});

const storeUser = useUserStore();

const handleGoogleSignUp = () => {
  storeUser.handleGoogleSignUp();
};
</script>
<style>
.custom-class-google-button {
  width: 100%;
  /* height: 48px; */
  /* color: #0c1026; */
  /* background: #88eeb1; */
  /* border-radius: 25px; */
  /* font-size: 16px; */
}
</style>
