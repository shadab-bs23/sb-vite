<template>
  <div class="px-3 py-2 extended-light-green-bg rounded row mx-auto">
    <div
      class="drop-zone rounded d-flex align-items-center mb-2 col-sm-12 col-md-9"
      ref="dropZoneElement"
      @click="handleDropZoneClick"
      @dragover="handleDropZoneDragOver"
      @dragleave="removeDropZoneBackground"
      @dragend="removeDropZoneBackground"
      @drop="handleDropZoneDrop"
    >
      <span
        class="d-flex align-items-center rounded h-100 w-100 ms-2"
        ref="thumbnailElement"
      >
        <img :src="photoIcon" alt="photo/icon" class="me-2" />
        <div class="d-flex align-items-center">
          <p class="file_name mb-0 text-truncate">
            {{ !file.name ? "Drag your photo or click!" : file?.name }}
          </p>
          <span v-if="file?.name" @click="(e) => removeFile(e)"
            ><i class="fi fi-x-circle-fill ms-2"></i
          ></span>
        </div>
      </span>
      <input
        type="file"
        name="myFile"
        class="d-none"
        ref="inputElement"
        :accept="supportedFormats"
        @change="handleInputChange"
      />
    </div>
    <div
      class="col-sm-12 col-md-3 ms-auto d-flex align-items-center justify-content-end"
    >
      <BaseButton
        type="button"
        button-class="rounded-pill sb-btn-md sb-btn-primary-alt w-auto"
        @click="handleDropZoneClick"
      >
        <i class="fi fi-upload me-2"></i> {{ t("button.upload") }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import photoIcon from "@/assets/img/sharebus/publish/photoIcon.svg";
import BaseButton from "@busgroup/vue3-base-button";
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
const file = ref({ name: "" });

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
    file.value = e.dataTransfer.files[0];
    emit("onSelectFile", file.value);
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
    file.value = (inputElement.value as HTMLInputElement).files?.[0] as File;
    emit("onSelectFile", file.value);
  }
};

const removeFile = (e: Event) => {
  e.stopPropagation();
  if ((inputElement.value as HTMLInputElement).files?.length) {
    (inputElement.value as HTMLInputElement).value = "";
  }
  file.value = { name: "" };
  emit("onRemoveFile");
};
</script>

<style scoped lang="scss">
.drop-zone {
  height: 87px;
  cursor: pointer;
}

.file_name {
  max-width: 190px; //recommended by bootstrap for text trunction.
}
</style>
