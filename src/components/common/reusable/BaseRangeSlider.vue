<template>
  <div class="range-wrap">
    <input
      :id="rangeId"
      type="range"
      class="range"
      :class="rangeClass"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @change="(e) => handleChange(e)"
    />
    <output class="bubble"></output>
    <div class="progressBar"></div>
    <div class="progressBar2"></div>
    <output class="pb-2-value-indicator">
      <span class="tickets"></span>
      <span>{{ pb2Desc }}</span>
    </output>
    <div class="runnable-track"></div>
    <div class="scale">
      <p class="min-range">{{ min }}</p>
      <p class="max-range">{{ max }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";

const props = defineProps({
  rangeId: {
    type: String,
    required: false,
    default: "customRange",
  },
  containerClass: {
    type: String,
    required: false,
    default: "",
  },
  labelText: {
    type: String,
    required: false,
    default: "",
  },
  labelClass: {
    type: String,
    required: false,
    default: "text-start",
  },
  modelValue: {
    type: Number,
    required: true,
    default: 0,
  },
  rangeClass: {
    type: String,
    required: false,
    default: "",
  },
  min: {
    type: Number,
    required: false,
    default: null,
  },
  max: {
    type: Number,
    required: false,
    default: null,
  },
  step: {
    type: Number,
    required: false,
    default: null,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  pb2Value: {
    type: Number,
    required: false,
    default: 0,
  },
  pb2Desc: {
    type: String,
    required: false,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

let range: HTMLInputElement;
let bubble: HTMLElement;
let progressBar: HTMLElement;
let progressBar2: HTMLElement;
let pb2ValueIndicator: HTMLElement;
let tickets: HTMLElement;
let minRangeEl: HTMLElement;
let maxRangeEl: HTMLElement;

onMounted(() => {
  range = document.querySelector(".range") as HTMLInputElement;
  bubble = document.querySelector(".bubble") as HTMLElement;
  progressBar = document.querySelector(".progressBar") as HTMLElement;
  progressBar2 = document.querySelector(".progressBar2") as HTMLElement;
  tickets = document.querySelector(".tickets") as HTMLElement;
  minRangeEl = document.querySelector(".min-range") as HTMLElement;
  maxRangeEl = document.querySelector(".max-range") as HTMLElement;

  pb2ValueIndicator = document.querySelector(
    ".pb-2-value-indicator"
  ) as HTMLElement;

  range.addEventListener("input", () => {
    setBubble();
    setPB2Indicator();
  });
  setBubble();
  setPB2Indicator();
});

watch(
  () => props.modelValue,
  (newValue) => {
    range.value = newValue.toString();
    setBubble();
  }
);

watch(
  () => props.pb2Value,
  () => {
    setPB2Indicator();
  }
);

function setBubble() {
  const val = Number(range.value);
  const min = Number(range.min) ? Number(range.min) : 0;
  const max = Number(range.max) ? Number(range.max) : 100;
  const newVal = Number(((val - min) * 100) / (max - min));

  bubble.innerHTML = val.toString();

  // Sorta magic numbers based on size of the native UI thumb
  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
  progressBar.style.width = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
}

const setPB2Indicator = () => {
  const min = Number(range.min) ? Number(range.min) : 0;
  const max = Number(range.max) ? Number(range.max) : 100;

  let pb2TrackValue;

  minRangeEl.innerHTML = range.min;
  maxRangeEl.innerHTML = range.max;

  if (props.pb2Value < min) {
    progressBar2.style.width = "0px";
    pb2ValueIndicator.style.left = "0px";
    pb2ValueIndicator.style.display = "none";
    return;
  } else if (props.pb2Value > max) {
    progressBar2.style.width = "0px";
    pb2ValueIndicator.style.left = "0px";
    pb2ValueIndicator.style.display = "none";
    return;
  } else {
    if (props.pb2Value === min) {
      minRangeEl.innerHTML = "";
    } else if (props.pb2Value === max) {
      maxRangeEl.innerHTML = "";
    }

    pb2ValueIndicator.style.display = "flex";
    tickets.innerHTML = props.pb2Value.toString();
    pb2TrackValue = Number(((props.pb2Value - min) * 100) / (max - min));
  }

  progressBar2.style.width = `calc(${pb2TrackValue}% + (${
    8 - pb2TrackValue * 0.15
  }px))`;
  pb2ValueIndicator.style.left = `calc(${pb2TrackValue}% + (${
    8 - pb2TrackValue * 0.15
  }px))`;
};

const handleChange = (e: Event) => {
  emit(
    "update:modelValue",
    Number.parseInt((e.target as HTMLInputElement).value)
  );
};
</script>
<style lang="scss" scoped>
.range-wrap {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
}
.range {
  -webkit-appearance: none;
  width: 100%;
  height: 12px;
  outline: none;
  border-radius: 3px;
  transition: all 0.1s ease-in-out;
  background: transparent;
  cursor: pointer;
  position: absolute;
  z-index: 3;
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 25px;
  height: 25px;
  border-radius: 15px;
  cursor: pointer;
  background-color: green;
  border: none;
}

.range::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 15px;
  cursor: pointer;
  background-color: green;
  border: none;
}

.bubble {
  background: green;
  color: white;
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 57px;
  height: 32px;
  border-radius: 15px;
  font-size: 16px;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
}

.bubble::after {
  content: " ";
  position: absolute;
  width: 0;
  height: 0;
  left: 50%;
  transform: translateX(-50%);
  right: 0px;
  bottom: -10px;
  width: 10px;
  height: 10px;
  background-image: linear-gradient(to top right, transparent 50%, green 0),
    linear-gradient(to bottom right, green 50%, transparent 0);
  background-size: 50% 100%;
  background-repeat: no-repeat;
  background-position: left, right;
}

.pb-2-value-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  width: 200px;
}

.pb-2-value-indicator::before {
  content: "";
  height: 20px;
  width: 1px;
  margin-left: 8px;
  background-color: black;
  margin-top: 10px;
  margin-bottom: 3px;
}

.progressBar {
  position: absolute;
  left: 5px;
  z-index: 1;
  height: 8px;
  border-radius: 5px;
  background-color: green;
  transition: all 0.3s ease-in-out;
}

.progressBar2 {
  position: absolute;
  left: 5px;
  z-index: 2;
  height: 8px;
  border-radius: 5px;
  background-color: black;
  transition: all 0.3s ease-in-out;
}

.runnable-track {
  position: absolute;
  left: 5px;
  right: 5px;
  z-index: 0;
  height: 8px;
  border-radius: 5px;
  background-color: #a5f2c4;
}

.scale {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 0;
}
</style>
