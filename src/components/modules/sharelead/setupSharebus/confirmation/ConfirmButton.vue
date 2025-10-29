<template>
  <div class="d-flex btn-group-discount">
    <BaseButton
      :button-text="t('common.yes')"
      @click="isDecisionTaken = DECISION_RESULT.YES"
      :button-class="`gray-white-bg ship-gray btn-discount-size rounded-start ${
        isDecisionTaken === DECISION_RESULT.YES ? 'btn-active' : ''
      }`"
    /><BaseButton
      @click="isDecisionTaken = DECISION_RESULT.NO"
      :button-text="t('common.no')"
      :button-class="`gray-white-bg ship-gray btn-discount-size rounded-end ${
        isDecisionTaken === DECISION_RESULT.NO ? 'btn-active' : ''
      }`"
    />
  </div>
</template>
<script setup lang="ts">
import BaseButton from "@busgroup/vue3-base-button";
import { useSharebusStore } from "@/store";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { DECISION_RESULT } from "../enums/SetUpShareBusEnum";
const { t } = useI18n();

const props = defineProps({
  decisionFor: {
    type: String,
    required: true,
  },
});
const sharebus = useSharebusStore();

const isDecisionTaken = computed({
  get: () => sharebus.getStepThreeData[props.decisionFor],
  set: (value) => {
    sharebus.setStep3DataSpecific(props.decisionFor, value);
  },
});
</script>
<style scoped lang="scss">
.btn-active {
  background-color: #138340 !important;
  color: #fefffe !important;
}
</style>
