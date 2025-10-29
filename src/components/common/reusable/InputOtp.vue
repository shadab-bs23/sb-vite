<template>
  <div class="otp-inputs" @paste.prevent="handlePaste">
    <input
      v-for="(_, index) in length"
      :key="index"
      :ref="(el: any) => setInputRef(el, index)"
      class="otp-box"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      pattern="[0-9]*"
      maxlength="1"
      :value="digits[index]"
      @input="onInput(index, $event)"
      @keydown="onKeyDown"
      @keydown.backspace.prevent="onBackspace(index)"
      @keydown.left.prevent="focusPrev(index)"
      @keydown.right.prevent="focusNext(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUpdate, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  length: {
    type: Number,
    default: 6,
  },
});

const emit = defineEmits(["update:modelValue", "complete"]);

const digits = ref<string[]>(Array(props.length).fill(""));
const inputRefs = ref<HTMLInputElement[]>([]);

const setInputRef = (el: any, index: number) => {
  const input = (el as HTMLInputElement) || null;
  if (input) inputRefs.value[index] = input;
};

onBeforeUpdate(() => {
  inputRefs.value = [];
});

const sanitizeDigits = (value: string) => value.replace(/\D/g, "");

const focusNext = (index: number) => {
  const nextIndex = Math.min(index + 1, props.length - 1);
  inputRefs.value[nextIndex]?.focus();
};

const focusPrev = (index: number) => {
  const prevIndex = Math.max(index - 1, 0);
  inputRefs.value[prevIndex]?.focus();
};

const syncEmit = () => {
  const value = digits.value.join("");
  emit("update:modelValue", value);
  if (value.length === props.length) emit("complete", value);
};

const onInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const entered = sanitizeDigits(target.value);

  if (!entered) {
    digits.value[index] = "";
    syncEmit();
    return;
  }

  let currIndex = index;
  for (const ch of entered) {
    if (currIndex >= props.length) break;
    digits.value[currIndex] = ch;
    currIndex++;
  }

  // ensure input shows only a single digit
  target.value = digits.value[index] || "";

  syncEmit();

  nextTick(() => {
    if (currIndex <= props.length - 1) {
      inputRefs.value[currIndex]?.focus();
    }
  });
};

const onBackspace = (index: number) => {
  if (digits.value[index]) {
    digits.value[index] = "";
    syncEmit();
    return;
  }
  focusPrev(index);
};

const onKeyDown = (event: KeyboardEvent) => {
  const allowed = [
    "Backspace",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Delete",
    "Home",
    "End",
  ];
  if (allowed.includes(event.key)) return;
  // Allow shortcuts like Ctrl+V/Cmd+V
  if (
    (event.ctrlKey || event.metaKey) &&
    ["v", "V", "c", "C", "x", "X", "a", "A"].includes(event.key)
  )
    return;
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const pasted = sanitizeDigits(event.clipboardData?.getData("text") || "");
  if (!pasted) return;
  const chars = pasted.slice(0, props.length).split("");
  digits.value = Array.from({ length: props.length }, (_, i) => chars[i] || "");
  syncEmit();
  nextTick(() => {
    const nextEmpty = digits.value.findIndex((c) => !c);
    const focusIndex = nextEmpty === -1 ? props.length - 1 : nextEmpty;
    inputRefs.value[focusIndex]?.focus();
  });
};

// keep local with external modelValue
watch(
  () => props.modelValue,
  (val) => {
    const clean = sanitizeDigits(val || "");
    const chars = clean.slice(0, props.length).split("");
    digits.value = Array.from(
      { length: props.length },
      (_, i) => chars[i] || ""
    );
  },
  { immediate: true }
);

onMounted(() => {
  nextTick(() => inputRefs.value[0]?.focus());
});
</script>

<style scoped>
.otp-inputs {
  display: flex;
  flex-wrap: nowrap;
  gap: 12px;
  justify-content: flex-start;
}

.otp-box {
  width: 48px;
  height: 48px;
  padding: 0;
  text-align: center;
  font-size: 20px;
  line-height: 48px;
  border-radius: 8px;
  border: 1px solid #d0d7de;
  background-color: #fff;
}

.otp-box:focus {
  outline: none;
  border-color: #5b9cff;
  box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.2);
}

.otp-box::-webkit-outer-spin-button,
.otp-box::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.otp-box[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
