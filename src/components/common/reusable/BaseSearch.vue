<template>
  <div :class="`position-relative bg-white rounded-pill ${wrapperClass}`">
    <BaseInput
      v-model="searchText"
      :placeholder="placeHolderText"
      input-group-class="w-75 ms-3 mb-0 h-lg"
      :modifier-class="`border-0 text-${
        searchText ? 'start' : 'center'
      } rounded-pill`"
      @keydown.enter="handleSearch"
    />
    <BaseButton
      button-class="sb-btn-lg sb-btn-primary position-absolute top-50 end-0 translate-middle-y z-index-top fw-600 rounded-pill text-white"
      @click="handleSearch"
    >
      <template v-slot:default>
        <span class="for-desk">
          <span class="d-flex justify-content-center align-items-center">
            <span class="ms-2">{{ searchBtnLabel }}</span>
            <span class="fw-bold ms-2"
              ><i class="fi fi-arrow-right-short"></i
            ></span>
          </span>
        </span>
        <span class="for-mobile">
          <span class="fw-bold"><i class="fi fi-search"></i></span>
        </span>
      </template>
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import BaseInput from "@busgroup/vue3-base-input";
import BaseButton from "@busgroup/vue3-base-button";

const props = defineProps({
  wrapperClass: {
    type: String,
    required: false,
    default: "",
  },
  placeHolderText: {
    type: String,
    required: false,
    default: "Search",
  },
  searchBtnLabel: {
    type: String,
    required: true,
  },
  clearInput: {
    type: [Boolean, String],
    required: false,
    default: false,
  },
  querySearch: {
    type: String,
    required: false,
    default: "",
  },
});

const emit = defineEmits(["onSearch"]);

const searchText = ref("");

const handleSearch = () => {
  const searchTxt = searchText.value;
  emit("onSearch", searchTxt);
};

onMounted(() => {
  if (props.querySearch) searchText.value = props.querySearch;
});

watch(
  () => props.clearInput,
  (clearInput) => {
    if (clearInput) {
      searchText.value = "";
    }
  }
);
</script>
