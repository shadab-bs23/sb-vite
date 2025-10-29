<template>
  <div class="row col-sm-12 col-md-6 offset-md-3 card p-5">
    <div v-if="isAuthSupport">
      <p
        class="info-yellow-2-bg p-2 small mw-100"
        v-html="t('sharebus.joiner.contact.user_restore_heading')"
      ></p>
    </div>
    <h3 class="text-start">
      <span>{{ t("sharebus.joiner.contact.submit_request") }} </span>
      <template v-if="!isAuthSupport">
        (<button
          @click="goBack"
          class="btn green-jewel fw-600 px-0 text-decoration-underline"
        >
          #{{ bookingReference }}</button
        >)</template
      >
    </h3>

    <form @submit.prevent="onSubmit" class="text-start">
      <div>
        <label for="subject" class="fs-6 fw-600"
          >{{ t("sharebus.joiner.contact.subject") }} (*)</label
        >
        <Field
          name="subject"
          as="input"
          id="subject"
          class="form-control my-1"
        />
        <ErrorMessage name="subject" class="text-danger" />
      </div>

      <div class="mt-2">
        <label for="email" class="fs-6 fw-600"
          >{{ t("sharebus.joiner.contact.email") }} (*)</label
        >
        <Field name="email" as="input" id="email" class="form-control my-1" />
        <ErrorMessage name="email" class="text-danger" />
      </div>
      <div class="mt-2">
        <label for="phone_number" class="fs-6 fw-600">{{
          t("sharebus.joiner.contact.phone_number")
        }}</label>
        <Field
          name="phone_number"
          as="input"
          id="phone_number"
          class="form-control my-1"
        />
        <ErrorMessage name="phone_number" class="text-danger" />
      </div>

      <div class="mt-2">
        <label for="description" class="fs-6 fw-600"
          >{{ t("sharebus.joiner.contact.description") }} (*)</label
        >
        <Field
          name="description"
          as="textarea"
          id="description"
          class="form-control my-1"
        />
        <p>{{ t("sharebus.joiner.contact.description_message") }}</p>
        <ErrorMessage name="description" class="text-danger" />
      </div>

      <div class="mt-2" v-if="!isAuthSupport && showAttachmentUploadOption">
        <label for="attachments" class="fs-6 fw-600">{{
          t("sharebus.joiner.contact.attachments")
        }}</label>
        <FileDropZone
          class="info-ongoing-bg"
          @on-select-file="handleFileSelection"
          @on-remove-file="handleFileSelection"
        />
        <div
          v-for="(file, index) in (files as File[])"
          :key="index"
          class="border rounded p-2 d-flex justify-content-between align-items-center my-4"
        >
          <a href="#" class="green-jewel" @click="getFileLink(file)"
            >{{ file.name }}
          </a>
          <button type="button" class="btn" @click="removeFile(index)">
            <div>
              <i class="bi bi-x fs- text-danger"></i>
              <span class="button-text"
                ><i class="fi fi-trash text-danger"></i
              ></span>
            </div>
          </button>
        </div>

        <ErrorMessage name="attachments" class="text-danger" />

        <PreviewImage
          :show="showPreviewModal"
          :imageSrc="imageSrc"
          @close="handleModalClose"
        />
      </div>
      <button type="submit" class="btn sb-btn-primary sb-btn-md mt-3">
        {{ t("button.submit") }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import FileDropZone from "@/components/common/fileUpload/FileDropZone.vue";
import { goBack, routePush } from "@/utils";
import { useForm, Field, ErrorMessage, useField } from "vee-validate";
import { computed, nextTick, ref } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import PreviewImage from "@/components/common/fileUpload/PreviewImage.vue";
import { s3MultipleFileUpload } from "@/composables/useS3Bucket";
import { showToast } from "@/services/toast/toast.service";
import { useRoute } from "vue-router";
import { SupportRequestInput } from "@/store/trip/joiner/types";
import { useJoinerTripStore } from "@/store";
import { SUPPORTED_REQUEST } from "@/components/common/enums/enums";

defineProps({
  bookingReference: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();
const route = useRoute();
const joinerTripStore = useJoinerTripStore();
/**
 * put it for time being, will be removed once we have proper support for attachments from backend
 */
const showAttachmentUploadOption = ref(false);

const showPreviewModal = ref(false);
const imageSrc = ref("");

const isAuthSupport = computed(
  () => route.query && route.query.support_type === "auth"
);

const initialValues = {
  subject: isAuthSupport.value ? "User restore request" : "",
  description: "",
  attachments: [],
  email: "",
  phone_number: "",
};

const filesSchema = computed(() =>
  yup.array().of(
    yup
      .mixed()
      .test(
        "fileType",
        `${t("form.image.format_unsupported")} ${t(
          "form.image.valid_formats"
        )}`,
        (file: File) => checkFileType(file)
      )
      .test(
        "fileSize",
        `${t("form.image.large_size")} ${t("form.image.valid_size", {
          count: 3,
        })}`,
        (file: File) => checkFileSize(file, 3000000)
      )
      .test(
        "photoDimension",
        `${t("form.image.can_not_upload")} ${t("form.image.valid_dimensions")}`,
        async (file: File): Promise<boolean> => {
          const res = await isPhotoDimensionsValid(file);
          return res;
        }
      )
  )
);

const contactFormSchema = computed(() =>
  yup.object({
    subject: yup.string().required(
      t("form.validation.field_required", {
        field_name: t("sharebus.joiner.contact.subject"),
      })
    ),
    description: yup.string().required(
      t("form.validation.field_required", {
        field_name: t("sharebus.joiner.contact.description"),
      })
    ),
    email: yup
      .string()
      .email(
        t("form.validation.invalid_email", {
          field_name: t("sharebus.joiner.contact.email"),
        })
      )
      .required(
        t("form.validation.field_required", {
          field_name: t("sharebus.joiner.contact.email"),
        })
      ),
    phone_number: yup.string().optional(),
    attachments: filesSchema.value,
  })
);

const { handleSubmit, resetForm } = useForm({
  initialValues,
  validationSchema: contactFormSchema,
});

const { value: files, setErrors: setFileErr } = useField<File[]>("attachments");

/** File validations */
/**
 * Checks if file size is valid or not.
 *
 * @param {File} file
 */
const checkFileSize = (file: File, requiredSize: number) => {
  return file ? file.size < requiredSize : true;
};

/**
 * Checks if the file type is valid or not.
 *
 * @param {File} file
 */
const checkFileType = (file: File) => {
  const fileTypes = ["image/jpeg", "image/png"];
  if (file) {
    if (fileTypes.indexOf(file.type) > -1) {
      return true;
    } else {
      return false;
    }
  } else return true;
};

/** get photo dimensions
 *
 *  @param {File} image
 * @return {Promise} - Width and height of the image.
 */
const getPhotoDimensions = (
  image: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    try {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        const img = new Image();

        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };

        img.src = fileReader.result as string;
      };

      fileReader.readAsDataURL(image);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * check if photo dimensions are valid.
 *
 * @param {File} file
 * @return {Promise<boolean>}
 */
const isPhotoDimensionsValid = async (file: File): Promise<boolean> => {
  if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
    try {
      const imgDimension = await getPhotoDimensions(file);

      if (imgDimension.width >= 500 && imgDimension.height >= 500) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Handle any errors that occur during the promise execution
      console.error("Error while getting photo dimensions:", error);
      return false; // or reject(error) depending on how you want to handle errors
    }
  } else {
    return true;
  }
};

const handleFileSelection = (selectedFiles: FileList) => {
  let i = 0;
  const keys = Object.keys(files.value);
  const lastKey = keys.length ? Number(keys[keys.length - 1]) + 1 : 0;

  while (i < selectedFiles.length) {
    files.value[lastKey + i] = selectedFiles[i++];
  }

  //validation check
  filesSchema.value
    .validate(files.value)
    .then(() => ({}))
    .catch((error) => {
      setFileErr(error.errors);
    });
};

const getFileLink = (file: File) => {
  const fileTypes = ["image/jpeg", "image/png"];
  if (file) {
    if (fileTypes.indexOf(file.type) > -1) {
      imageSrc.value = URL.createObjectURL(file);
      showPreviewModal.value = true;
    }
  }
};

const removeFile = (fileIndex: number) => {
  files.value.splice(fileIndex, 1);
  //validation check
  filesSchema.value
    .validate(files.value)
    .then(() => ({}))
    .catch((error) => {
      setFileErr(error.errors);
    });
  if (!files.value.length) setFileErr("");
};

const handleModalClose = () => {
  showPreviewModal.value = false;
  URL.revokeObjectURL(imageSrc.value);
  imageSrc.value = "";
};

const onSubmit = handleSubmit(async (values) => {
  const { subject, description, attachments, email, phone_number } = values;
  /**
   * Construct the contact message
   */
  const contactMessage = `Customer Contact Information: Email: ${email} ${
    phone_number ? `Phone: ${phone_number}` : ""
  }

Message:
${description}
`;
  const payload: SupportRequestInput = {
    trip_id: isAuthSupport.value ? "" : (route.params.tag as string),
    subject,
    description: contactMessage,
    attachment_urls: [],
    country: route.query.country as string,
    support_type: isAuthSupport.value
      ? SUPPORTED_REQUEST.ACCOUNT_RESTORE
      : SUPPORTED_REQUEST.TRIP,
  };

  try {
    // Upload attachments if any
    if (attachments.length > 0) {
      payload.attachment_urls = await s3MultipleFileUpload(attachments);
    }

    // Submit the support request
    const response = await joinerTripStore.submitSupportRequest(payload);

    // Handle successful response
    if (response?.data) {
      showToast("success", t("sharebus.joiner.contact.support_req_submitted"));

      // Proceed with further actions after the toast
      await nextTick();
      if (!isAuthSupport.value) {
        goBack();
      } else {
        routePush("home");
      }
      resetForm();
    }
  } catch (err) {
    // Handle errors
    showToast("error", t("sharebus.joiner.contact.unable_req_submission"));
  }
});
</script>
