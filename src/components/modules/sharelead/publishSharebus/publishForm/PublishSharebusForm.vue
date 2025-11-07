<template>
  <div>
    <h2 class="fw-bold" v-if="isEditingMode">
      {{ t("sales.details.edit_published_trip_info") }}
    </h2>
    <BaseSaveChanges
      v-if="isEditingMode"
      @saveChanges="changesAction"
      class="col-md-10 col-lg-10 col-xl -6 col-sm-12 my-3 col-xxl-4"
    />
    <hr class="border border-2" />
  </div>
  <form @submit.prevent="handleFormSubmission" enctype="multipart/form-data">
    <div class="col-sm-12 col-md-6 my-4">
      <h4 :class="`fw-600 ${tripNameErrMsg ? 'text-danger' : 'ship-gray'}`">
        {{ t("sharebus.publish.trip_name") }}*
      </h4>
      <p class="ship-gray">{{ t("sharebus.publish.trip_name_desc") }}</p>
      <BaseInput
        v-model="tripName"
        id="name"
        :modifier-class="`rounded ${tripNameErrMsg ? 'is-invalid' : ''}`"
      />
      <p
        class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 mw-100 rounded"
        v-if="tripNameErrMsg"
      >
        {{ tripNameErrMsg }}
      </p>
    </div>
    <div class="my-3">
      <h4 :class="`fw-600 ${tripCategoryErrMsg ? 'text-danger' : 'ship-gray'}`">
        {{ t("common.category") }}*
      </h4>
      <TripCategory
        :selected-category="tripCategory"
        @on-select-trip-category="handleTripCategorySelection"
      />
      <p
        class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
        v-if="tripCategoryErrMsg"
      >
        {{ tripCategoryErrMsg }}
      </p>
    </div>
    <div class="my-2 col-sm-12 col-md-5 ship-gray my-3">
      <p>{{ t("sharebus.publish.who_organizes") }}</p>
      <BaseInput
        v-model="organizer"
        id="trip_organizer"
        modifier-class="rounded"
      />
      <p
        class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded mt-2"
        v-if="organizerErrMsg"
      >
        {{ organizerErrMsg }}
      </p>
    </div>
    <div class="col-sm-12 col-md-12 mb-4">
      <h4 class="fw-600 ship-gray">
        {{ t("sharebus.publish.optional_info") }}
      </h4>
      <div class="my-2 col-sm-12 col-md-8 ship-gray">
        <p :class="`${travelerInfoErrMsg ? 'text-danger' : 'ship-gray'}`">
          {{ t("sharebus.publish.info_to_travellers") }}
        </p>
        <div class="col-12">
          <textarea
            id="infoToTravelers"
            :class="`border-light w-100 rounded ${
              travelerInfoErrMsg ? 'border-error' : 'ship-gray'
            }`"
            v-model="travelerInfo"
          ></textarea>
          <p
            class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
            v-if="travelerInfoErrMsg"
          >
            {{ travelerInfoErrMsg }}
          </p>
        </div>
      </div>
      <div class="my-2 col-sm-12 col-md-8 ship-gray">
        <p>{{ t("sharebus.publish.link_to_event") }}</p>
        <BaseInput
          v-model="eventLink"
          id="website_url"
          modifier-class="rounded"
        />
        <p
          class="text-start ship-gray py-3 ps-2 fw-600 auth-error fs-6 rounded"
          v-if="eventLinkErrMsg"
        >
          {{ eventLinkErrMsg }}
        </p>
      </div>
      <div class="my-2">
        <p>{{ t("common.upload_photo_logo") }}</p>
        <!-- upload div -->
        <FileDropZone
          @on-select-file="handleFileSelection"
          @on-remove-file="handleFileSelection"
        />
        <p
          class="text-start ship-gray py-3 ps-2 mt-1 fw-600 auth-error fs-6 rounded mw-100"
          v-if="photoErrMsg"
        >
          {{ photoErrMsg }}
        </p>
      </div>
    </div>
    <hr />
    <div class="w-100 text-end mt-2 ship-gray">
      <p
        class="error-input-color text-start fw-600 d-flex"
        v-if="!publishSharebusForm.meta.value.valid && submitBtnClicked"
      >
        {{ t("form.validation.field_missing_or_invalid") }}
      </p>
      <BaseButton
        button-class="sb-btn-primary sb-btn-lg px-4  rounded-pill d-flex align-items-center fw-bold ms-auto"
        type="button"
        @click="previewModal.toggleShow"
      >
        <template v-slot:default>
          <span>{{
            isEditingMode ? "Preview" : t("button.preview_and_publish")
          }}</span>
          <span class="fw-600 ms-2">
            <i class="fi fi-arrow-right-short"></i>
          </span>
        </template>
      </BaseButton>
    </div>
  </form>
  <PreviewModal
    v-model="previewModal.show.value"
    :toggle-modal="() => previewModal.toggleShow()"
    :publish-data="publishInfoData"
    :is-editing-mode="isEditingMode"
    @publish="handlePublish"
  />
</template>

<script setup lang="ts">
import { ROLE } from "@/components/common/enums/enums";
import FileDropZone from "@/components/modules/sharelead/publishSharebus/fileUpload/FileDropZone.vue";
import TripCategory from "@/components/modules/sharelead/publishSharebus/tripCategory/TripCategory.vue";
import { renameFile, s3FileUpload } from "@/composables/useS3Bucket";
import { useToggle } from "@/composables/useToggle";
import { ROUTE } from "@/router/enum/routeEnums";
import { showToast } from "@/services/toast/toast.service";
import {
  useSalesStore,
  useSharebusStore,
  useTripStore,
  useUserStore,
} from "@/store";
import { Trip } from "@/store/trip/privateTrip/types";
import { isValidURL, routePushTag, routePushTagQuery } from "@/utils";
import BaseButton from "@busgroup/vue3-base-button";
import BaseInput from "@busgroup/vue3-base-input";
import { useField, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import PreviewModal from "../tripPreview/PreviewModal.vue";
import { TripInfoData } from "@/store/sharebus/types";
const user = useUserStore();
const props = defineProps({
  tripId: {
    type: String,
    required: true,
  },
  formValue: {
    type: Object,
    default: () => ({}),
  },
  isEditingMode: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["changeValue"]);
const sharebusStore = useSharebusStore();
const shareLeadTripStore = useTripStore();
const salesStore = useSalesStore();

const { t } = useI18n();
const previewModal = useToggle();

const submitBtnClicked = ref(false);
const publishSharebusPhotoUrl = ref("");

const userDetails = computed(() => user);

/**
 * Method that sets the trip category.
 *
 * @param {string} selectedTripCategory - Selected trip category.
 */
const handleTripCategorySelection = (selectedTripCategory: string) => {
  publishSharebusForm.setFieldValue("category", selectedTripCategory);
};

const handleFileSelection = (file: File | null = null) => {
  publishSharebusForm.setFieldValue("image_url", file as unknown as string);
  publishSharebusPhotoUrl.value = "";
};

/*
 * validation schema for email form
 */
const publishSharebusFormSchema = computed(() =>
  yup.object({
    name: yup
      .string()
      .required(t("sharebus.publish.trip_name_missing"))
      .max(100, t("form.validation.max_length", { max: 100 })),
    category: yup
      .string()
      .required(t("sharebus.publish.trip_category_missing")),
    trip_organizer: yup.string().required(),
    info_to_travellers: yup
      .string()
      .max(300, t("form.validation.max_length", { max: 300 })),
    website_url: yup
      .string()
      .test("link", t("form.validation.invalid_link"), (value) =>
        value ? isValidURL(value) : true
      ),
    image_url: yup
      .mixed()
      .test("fileType", "", (file) => checkFileType(file))
      .test(
        "fileSize",
        `${t("form.image.large_size")} ${t("form.image.valid_size", {
          count: 5,
        })}`,
        (file) => checkFileSize(file)
      )
      .test(
        "photoDimension",
        `${t("form.image.can_not_upload")} ${t("form.image.valid_dimensions")}`,
        async (file): Promise<boolean> => {
          const res = await isPhotoDimensionsValid(file);
          return res;
        }
      ),
  })
);

const initialValue: TripInfoData = {
  name: props.formValue.name || "",
  category: props.formValue.category || "",
  image_url: props.formValue.image_url || "",
  website_url: props.formValue.website_url || "",
  trip_organizer: user.getUserInfo.attributes.name,
  info_to_travellers: props.formValue.info_to_travellers || "",
};

/*
 * getting validated value and also if form )validated or not as meta
 */
const publishSharebusForm = useForm({
  // Why we have used 'any' as a type please see the reference https://vee-validate.logaretm.com/v4/api/composition-helpers#api-reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: publishSharebusFormSchema,
  initialValues: initialValue,
});

const { value: tripName, errorMessage: tripNameErrMsg } =
  useField<string>("name");
const {
  value: tripCategory,
  errorMessage: tripCategoryErrMsg,
  setErrors: setTripCategoryErrors,
} = useField<string>("category");
const { value: travelerInfo, errorMessage: travelerInfoErrMsg } =
  useField<string>("info_to_travellers");
const { value: eventLink, errorMessage: eventLinkErrMsg } =
  useField<string>("website_url");
const { value: organizer, errorMessage: organizerErrMsg } =
  useField<string>("trip_organizer");
const { errorMessage: photoErrMsg, setErrors: setPhotoErr } =
  useField<File | null>("image_url");

watch(
  () => props.formValue,
  (value) => {
    if (Object.keys(value).length) {
      let temp = { ...value };
      temp.image_url = null;
      publishSharebusForm.setValues(temp);
    }
  },
  {
    immediate: true,
  }
);
watch(
  () => publishSharebusForm.meta.value.valid,
  (value) => {
    if (value && submitBtnClicked.value) {
      submitBtnClicked.value = false;
    }
  }
);

/**
 * Checks if file size is valid or not.
 *
 * @param {File} file
 */
const checkFileSize = (file: File) => {
  return file ? file.size < 5000000 : true;
};

/**
 * Checks if the file type is valid or not.
 *
 * @param {File} file
 */
const checkFileType = (file: File) => {
  if (file) {
    if (file.type === "image/jpeg" || file.type === "image/png") {
      return true;
    } else {
      setPhotoErr(
        `${t("form.image.format_unsupported")} ${t("form.image.valid_formats")}`
      );
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
const isPhotoDimensionsValid = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (file) {
      let imgDimension;
      try {
        getPhotoDimensions(file).then((res) => {
          imgDimension = res;

          if (imgDimension.width >= 500 && imgDimension.height >= 500) {
            resolve(true);
          }
          resolve(false);
        });
      } catch (e) {
        reject(e);
      }
    } else resolve(true);
  });
};

const onSubmit = publishSharebusForm.handleSubmit(() => {
  if (
    userDetails.value.currentRole !== ROLE.SHARELEAD &&
    userDetails.value.currentRole !== ROLE.PARTNER_SHARELEAD &&
    userDetails.value.currentRole !== ROLE.FERDIA_SALES &&
    userDetails.value.isAuthenticated
  ) {
    showToast("info", t("home.joiner_warning"), 3000, "top-left");
    return;
  }

  previewModal.toggleShow();
});
const changesAction = (value) => {
  if (!value) {
    routePushTagQuery("trip-sales-page", props.tripId, { tabindex: 1 });
    // publishSharebusForm.resetForm();
    // return;
  } else if (value && publishSharebusForm.meta.value.valid) {
    emit("changeValue", publishSharebusForm.values);
  }
};

const handleFormSubmission = () => {
  submitBtnClicked.value = true;
  if (
    !publishSharebusForm.values.category ||
    publishSharebusForm.values.category === ""
  ) {
    setTripCategoryErrors(t("sharebus.publish.select_trip_category"));
    return;
  }
  if (!publishSharebusForm.meta.value.valid) {
    onSubmit();
    return;
  }

  submitBtnClicked.value = false;
  onSubmit();
};
const tripInfo = computed<Trip>(() => {
  return shareLeadTripStore.getCurrentTrip;
});

const handlePublish = () => {
  if (
    publishSharebusForm.values.image_url &&
    !publishSharebusPhotoUrl.value &&
    !photoErrMsg.value
  ) {
    let renamedFile: File | null = null;
    //rename the file using trip id
    const file = publishSharebusForm.values.image_url as unknown as File;
    const ext = file.name.split(".")[1];
    renamedFile = renameFile(file, `${props.tripId}.${ext}`);
    // Upload the file in S3 and show preview modal.
    s3FileUpload(renamedFile, {
      uploadedBy: user.data.attributes.email,
      userId: user.data.id,
      tripId: props.tripId,
    }).then((res) => {
      (sharebusStore as any)
        .publishSharebus({
          id: tripInfo.value.id,
          name: publishSharebusForm.values.name as string,
          category: publishSharebusForm.values.category as string,
          info_to_travellers: publishSharebusForm.values
            .info_to_travellers as string,
          website_url: publishSharebusForm.values.website_url as string,
          image_url: res,
          trip_organizer: publishSharebusForm.values.trip_organizer as string,
        })
        .then(() => {
          const tripPageRoute =
            user.currentRole === ROLE.PARTNER_SHARELEAD
              ? ROUTE.PARTNER_SHARELEAD_TRIP_PAGE
              : ROUTE.SHARELEAD_TRIP_PAGE;
          routePushTag(tripPageRoute, props.tripId);
        })
        .catch((err) => console.log(err));
      previewModal.toggleShow();
    });
    return;
  }

  (sharebusStore as any)
    .publishSharebus({
      id: tripInfo.value.id,
      name: publishSharebusForm.values.name as string,
      category: publishSharebusForm.values.category as string,
      info_to_travellers: publishSharebusForm.values
        .info_to_travellers as string,
      website_url: publishSharebusForm.values.website_url as string,
      image_url: publishSharebusPhotoUrl.value,
      trip_organizer: publishSharebusForm.values.trip_organizer as string,
    })
    .then(() => {
      const tripPageRoute =
        user.currentRole === ROLE.PARTNER_SHARELEAD
          ? ROUTE.PARTNER_SHARELEAD_TRIP_PAGE
          : ROUTE.SHARELEAD_TRIP_PAGE;
      routePushTag(tripPageRoute, props.tripId);
    })
    .catch((err) => console.log(err));

  previewModal.toggleShow();
};

const salesTrip = salesStore.$state.salesEditTrip[props.tripId];
const data = (salesTrip?.trip_general_info || tripInfo.value) as Trip;

const publishInfoData = computed(() => {
  return {
    name: publishSharebusForm.values.name,
    category: publishSharebusForm.values.category,
    info_to_travellers: publishSharebusForm.values.info_to_travellers,
    website_url: publishSharebusForm.values.website_url,
    image_url:
      publishSharebusPhotoUrl.value ||
      publishSharebusForm.values.image_url ||
      data.image_url ||
      tripInfo.value.image_url,
    trip_organizer: publishSharebusForm.values.trip_organizer,
  };
});
</script>
