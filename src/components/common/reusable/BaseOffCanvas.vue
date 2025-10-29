<template>
  <!-- data-bs-toggle="offcanvas"
  data-bs-target="#offcanvasRight"
  aria-controls="offcanvasRight" -->
  <span @click="handleCanvasToggle">
    <slot name="triggerEl"></slot>
  </span>
  <div
    class="offcanvas offcanvas-end"
    :class="[offCanvasClass]"
    tabindex="-1"
    ref="offcanvas"
    id="offcanvasRight"
    aria-labelledby="offcanvasRightLabel"
    data-bs-scroll="true"
    data-bs-backdrop="false"
  >
    <div class="offcanvas-header" :class="[headerClass]">
      <!-- <h5 id="offcanvasRightLabel">Offcanvas right</h5> -->
      <span data-bs-dismiss="offcanvas" aria-label="Close">
        <slot name="closeEl"></slot>
      </span>
    </div>
    <div class="offcanvas-body" :class="[contentClass]">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import NavController from "../topbar/controller/NavController";

defineProps({
  offCanvasClass: {
    type: String,
    default: "",
  },
  headerClass: {
    type: String,
    default: "",
  },
  contentClass: {
    type: String,
    default: "",
  },
});

const offcanvas = ref();
const bsOffcanvas = ref();

onMounted(() => {
  bsOffcanvas.value = new window.bootstrap.Offcanvas(offcanvas.value);
});

const showThisCanvas = () => {
  bsOffcanvas.value.show();
  NavController.setSidebarActive(true);
};

const hideThisCanvas = () => {
  bsOffcanvas.value.hide();
  NavController.setSidebarActive(false);
};

const handleCanvasToggle = () => {
  if (!NavController.getSidebarActive()) {
    showThisCanvas();
    NavController.setMenuActive(false);
  } else hideThisCanvas();
};

watch(
  () => NavController.getMenuActive(),
  (hide) => {
    if (hide) hideThisCanvas();
  }
);
</script>
