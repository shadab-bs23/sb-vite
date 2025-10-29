<template>
  <button
    type="button"
    class="btn sb-btn-primary-alt sb-btn-sm action-button"
    @click="handleButtonAction"
  >
    <span>{{ label }}</span>
    <img :src="iconPath" :alt="altText" />
  </button>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  iconPath: {
    type: String,
    required: true,
  },
  altText: {
    type: String,
    required: true,
  },
  nextRoute: {
    type: String,
    required: true,
  },
  routeParams: {
    type: Object,
    default: () => ({}),
  },
  onClick: {
    type: Function,
    default: null,
  },
});

const router = useRouter();

const handleButtonAction = async () => {
  try {
    if (props.onClick) {
      await props.onClick();
    }
    await router.push({ name: props.nextRoute, params: props.routeParams });
  } catch (error) {
    console.error("Navigation error:", error);
  }
};
</script>

<style lang="scss" scoped>
.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
