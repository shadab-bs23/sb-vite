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
        <!-- Show image preview if available -->
        <div v-if="showImagePreview" class="d-flex align-items-center w-100">
          <img
            :src="imageUrl"
            alt="Selected image preview"
            class="me-2 rounded"
            style="width: 50px; height: 50px; object-fit: cover"
          />
          <div class="d-flex align-items-center flex-grow-1">
            <p class="file_name mb-0 text-truncate">
              {{ file.name }}
            </p>

            <span v-if="file?.name" @click="(e) => removeFile(e)"
              ><i class="fi fi-x-circle-fill ms-2"></i
            ></span>
          </div>
        </div>
        <!-- Show default upload UI if no image -->
        <div v-else class="d-flex align-items-center">
          <img :src="photoIcon" alt="photo/icon" class="me-2" />
          <div class="d-flex align-items-center">
            <p class="file_name mb-0 text-truncate">
              {{ !file.name ? "Drag your photo or click!" : file?.name }}
            </p>
            <span v-if="file?.name" @click="(e) => removeFile(e)"
              ><i class="fi fi-x-circle-fill ms-2"></i
            ></span>
          </div>
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
import { ref, computed, type PropType } from "vue";
import photoIcon from "@/assets/img/sharebus/publish/photoIcon.svg";
import BaseButton from "@busgroup/vue3-base-button";
import { useI18n } from "vue-i18n";

const props = defineProps({
  supportedFormats: {
    type: String,
    required: false,
    default: "image/png, image/jpeg",
  },
  initialFile: {
    type: [File, String] as PropType<File | string | null>,
    required: false,
    default: null,
  },
});
const emit = defineEmits(["onSelectFile", "onRemoveFile"]);

const { t } = useI18n();
const inputElement = ref<HTMLInputElement>();
const dropZoneElement = ref<HTMLElement>();
const thumbnailElement = ref<HTMLElement>();

// Track if user has explicitly removed the file
const fileExplicitlyRemoved = ref(false);

// Internal file state for user-selected files
const userSelectedFile = ref<{ name: string; file?: File; url?: string }>({
  name: "",
  file: undefined,
  url: undefined,
});

// Computed file state that prioritizes user-selected files over initial file
const file = computed(() => {
  // If user has explicitly removed the file, show empty state
  if (fileExplicitlyRemoved.value) {
    return {
      name: "",
      file: undefined,
      url: undefined,
    };
  }

  // If user has selected a file, use that
  if (userSelectedFile.value.name) {
    return userSelectedFile.value;
  }

  // Otherwise, use initial file if provided
  if (props.initialFile) {
    if (props.initialFile instanceof File) {
      return {
        name: props.initialFile.name,
        file: props.initialFile,
        url: URL.createObjectURL(props.initialFile),
      };
    } else if (typeof props.initialFile === "string") {
      return {
        name: props.initialFile.split("/").pop() || "Image",
        url: props.initialFile,
      };
    }
  }

  // Default empty state
  return {
    name: "",
    file: undefined,
    url: undefined,
  };
});

// Computed property to get the display URL for the image
const imageUrl = computed(() => {
  return file.value.url || "";
});

// Computed property to determine if we should show image preview
const showImagePreview = computed(() => {
  return !!imageUrl.value;
});

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
    const selectedFile = e.dataTransfer.files[0];
    fileExplicitlyRemoved.value = false; // Reset removal flag
    userSelectedFile.value = {
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
    };
    emit("onSelectFile", selectedFile);
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
    const selectedFile = (inputElement.value as HTMLInputElement)
      .files?.[0] as File;
    fileExplicitlyRemoved.value = false; // Reset removal flag
    userSelectedFile.value = {
      name: selectedFile.name,
      file: selectedFile,
      url: URL.createObjectURL(selectedFile),
    };
    emit("onSelectFile", selectedFile);
  }
};

const removeFile = (e: Event) => {
  e.stopPropagation();
  if ((inputElement.value as HTMLInputElement).files?.length) {
    (inputElement.value as HTMLInputElement).value = "";
  }
  // Clean up object URL if it exists to prevent memory leaks
  if (userSelectedFile.value.url && userSelectedFile.value.file) {
    URL.revokeObjectURL(userSelectedFile.value.url);
  }
  fileExplicitlyRemoved.value = true; // Mark file as explicitly removed
  userSelectedFile.value = { name: "", file: undefined, url: undefined };
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
