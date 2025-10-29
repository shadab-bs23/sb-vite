<template>
  <div class="list-breakdown-profile pt-5">
    <ul>
      <li class="d-flex justify-content-between">
        <p class="text-start fw-bold">
          {{ contactInfo.title }}
        </p>
        <a @click="confirmShow.toggleShow()">
          <span
            class="rounded-circle border border-1 border-light"
            :class="confirmShow.show.value ? 'extended-green-bg' : 'bg-white'"
            ><img
              class="p-1"
              :src="
                !confirmShow.show.value
                  ? '/img/trip-info/down-arrow.svg'
                  : '/img/trip-info/up-arrow.svg'
              "
          /></span>
        </a>
      </li>
      <li v-if="confirmShow.show.value">
        <p class="text-start">
          {{ contactInfo.description }}
        </p>
      </li>
      <li v-if="confirmShow.show.value" class="d-flex">
        <a
          class="sb-tertiary"
          :href="contactInfo.action_link"
          target="_blank"
          >{{ contactInfo.action_title }}</a
        >
        <img class="ms-2" src="/img/link.svg" />
      </li>
      <hr />
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { useToggle } from "@/composables/useToggle";
const confirmShow = useToggle();
defineProps({
  contactInfo: {
    type: Object,
    required: true,
  },
});
</script>
<style lang="scss">
.list-breakdown-profile ul {
  li {
    max-width: 100%;
    list-style-type: none;
  }
  padding: 0rem;
}
</style>
