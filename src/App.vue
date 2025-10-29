<template>
  <router-view />
</template>
<script lang="ts" setup>
import { computed, onMounted, watchEffect } from "vue";
import { useConfigStore, useUserStore } from "@/store/index";
import { routePushTag } from "./utils";
import { showToast } from "@/services/toast/toast.service";
import { initAmplify, refreshToken } from "./services/auth/auth.service";
import UriController from "./components/controller/UriController";

const storeUser = useUserStore();
const config = useConfigStore();
const country = computed(() => UriController.getQuery().country);
watchEffect(() => {
  if (country.value) {
    initAmplify(country.value);
  }
});

onMounted(async () => {
  config.fetchSetupSharebusConfig();
  await storeUser.fetchingUserInfo().catch(() => {
    refreshToken()
      .then(() => {
        storeUser.fetchingUserInfo().catch((err) => {
          actionOnExpire(err);
        });
      })
      .catch((err) => {
        actionOnExpire(err);
      });
  });
});

const actionOnExpire = (err) => {
  showToast("error", err);
  setTimeout(() => {
    storeUser.signOutAction();
    routePushTag("auth", "signin");
  }, 2000);
};
</script>

<style lang="scss">
#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
