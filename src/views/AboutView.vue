<template>
  <div class="about">
    <!-- {{ t("vue-i18n") }}
    <h1>This is an about page</h1>
    <button @click="mockUpdateUser">Mock update user</button> -->
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from "@vue/runtime-core";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { ALL_BOOK_QUERY, UPDATE_BOOK_QUERY } from "@/services/graphql/query";

onMounted(() => {
  const { result } = useQuery(ALL_BOOK_QUERY, null, {
    errorPolicy: "all",
  });
  /*
   * this console log is for test and understanding purpose, To whom it may concern
   */
  console.log(
    "🚀 ~ file: AboutView.vue ~ line 35 ~ onMounted ~ result",
    result
  );
  mutate();
});

const { mutate } = useMutation(UPDATE_BOOK_QUERY, () => ({
  variables: {
    id: "n12clfp3K",
    rating: 3,
  },
}));
</script>
