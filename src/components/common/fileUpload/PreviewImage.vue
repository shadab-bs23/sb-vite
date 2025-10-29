<!-- src/components/ImageModal.vue -->
<template>
  <div v-if="show" class="preview-modal-overlay" @click="close">
    <div class="preview-modal-content" @click.stop>
      <img :src="imageSrc" alt="Preview" class="preview-modal-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  imageSrc: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};
</script>

<style scoped>
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.preview-modal-content {
  background: rgba(255, 255, 255, 0.7);
  padding: 5px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  max-width: 60%;
  height: fit-content;
}

.preview-modal-image {
  max-width: 70%;
  object-fit: contain;
}
</style>
