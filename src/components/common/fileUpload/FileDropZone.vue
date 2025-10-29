<template>
  <div class="px-3 py-2 secondary-c5-bg rounded mx-auto">
    <div
      class="drop-zone rounded d-flex align-items-center"
      ref="dropZoneElement"
      @click="handleDropZoneClick"
      @dragover="handleDropZoneDragOver"
      @dragleave="removeDropZoneBackground"
      @dragend="removeDropZoneBackground"
      @drop="handleDropZoneDrop"
    >
      <span
        class="d-flex flex-column justify-content-center align-items-center rounded h-100 w-100 ms-2"
        ref="thumbnailElement"
      >
        <img src="/icons/upload.svg" alt="photo/icon" class="me-2 mb-2" />
        <div class="d-flex align-items-center">
          <p class="file_name text-truncate">
            {{ t("form.image.drag_here") }} {{ t("auth.common.or") }}
            <a href="#">{{ t("form.image.select_file") }}</a>
            {{ t("form.image.to_upload") }}
          </p>
        </div>
      </span>
      <input
        type="file"
        name="myFile"
        class="d-none"
        ref="inputElement"
        :accept="supportedFormats"
        multiple
        @change="handleInputChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

defineProps({
  supportedFormats: {
    type: String,
    required: false,
    default: "image/png, image/jpeg",
  },
});
const emit = defineEmits(["onSelectFile", "onRemoveFile"]);

const { t } = useI18n();
const inputElement = ref<HTMLInputElement>();
const dropZoneElement = ref<HTMLElement>();
const thumbnailElement = ref<HTMLElement>();

/** under the hood clicks on the input file element when user clicks on dropzone */
const handleDropZoneClick = () => {
  (inputElement.value as HTMLInputElement).click();
};

/** Triggers if the user drag a file over the dropzone */
const handleDropZoneDragOver = (e) => {
  e.preventDefault();
  (dropZoneElement.value as HTMLElement).classList.add("extended-green-bg");
};

/**
 * Triggers if the user drop a file in the dropzone
 * @param {e} - The event
 */
const handleDropZoneDrop = (e) => {
  e.preventDefault();

  if (e.dataTransfer.files.length) {
    (inputElement.value as HTMLInputElement).files = e.dataTransfer.files;
    emit("onSelectFile", (inputElement.value as HTMLInputElement).files);
  }

  (dropZoneElement.value as HTMLElement).classList.remove("extended-green-bg");
};

/** Removes the background of dropzone which was created by dragover event */
const removeDropZoneBackground = () => {
  (dropZoneElement.value as HTMLElement).classList.remove("extended-green-bg");
};

/** Triggers on file input element changes */
const handleInputChange = () => {
  if ((inputElement.value as HTMLInputElement).files?.length) {
    emit("onSelectFile", (inputElement.value as HTMLInputElement).files);
  }
};
</script>

<style scoped lang="scss">
.drop-zone {
  height: 100px;
  cursor: pointer;
}
</style>
