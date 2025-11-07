<template>
  <div class="reminder-panel">
    <!-- Header -->
    <header class="reminder-header d-flex align-items-center gap-2">
      <i class="fi fi-bell-fill text-success"></i>
      <h2>{{ t("sales.reminder.trip_reminders") }}</h2>
    </header>

    <!-- Reminder Items -->
    <main class="d-flex flex-column gap-3">
      <div
        class="d-flex flex-column align-items-start justify-content-start gap-3"
      >
        <span>{{ t("sales.reminder.sharelead_notify_on") }}</span>
        <div class="reminder-time d-flex align-items-start gap-3 text-left">
          <strong>
            {{
              convertDateIntoCompanyTimezone(
                trip?.deadline_passenger_goal_reminder,
                "dd-MM-yyyy"
              )
            }}
          </strong>
          <strong>{{ config.PassengerGoalReminderTimeOfDay }}</strong>
        </div>
      </div>

      <div
        class="d-flex flex-column align-items-start justify-content-start gap-3"
      >
        <span>{{ t("sales.reminder.trip_will_be_canceled") }}</span>
        <div class="reminder-time d-flex align-items-start gap-3 text-left">
          <strong>
            {{
              convertDateIntoCompanyTimezone(
                trip?.deadline_passenger_goal_reminder,
                "dd-MM-yyyy"
              )
            }}
          </strong>
          <strong>{{ config.PassengerGoalDeadlineTimeOfDay }}</strong>
        </div>
      </div>

      <div
        class="d-flex flex-column align-items-start justify-content-start gap-3"
      >
        <span>{{ t("sales.reminder.ticket_sale_end") }}</span>
        <div class="reminder-time d-flex align-items-start gap-3 text-left">
          <strong>
            {{
              convertDateIntoCompanyTimezone(
                trip?.deadline_ticket_selling,
                "dd-MM-yyyy"
              )
            }}
          </strong>
          <strong>{{ config.TicketSalesDeadlineTimeOfDay }}</strong>
        </div>
      </div>

      <div
        class="d-flex flex-column align-items-start justify-content-start gap-3"
      >
        <span>{{ t("sales.reminder.passengers_will_notified_on") }}</span>
        <div class="reminder-time d-flex align-items-start gap-3 text-left">
          <strong>
            {{
              convertDateIntoCompanyTimezone(
                trip?.deadline_trip_reminder,
                "dd-MM-yyyy"
              )
            }}
          </strong>
          <strong>{{ config.TripReminderTimeOfDay }}</strong>
        </div>
      </div>
    </main>

    <!-- Info box -->
    <aside class="info-notice text-start d-flex align-items-center p-4 gap-2">
      <i class="fi fi-info-circle-fill"></i>
      <p>{{ t("sales.reminder.reminder_note_helper") }}</p>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ScheduledConfig, SetupSharebusConfig } from "@/store/config/types";
import { convertDateIntoCompanyTimezone } from "@/utils/companyTimeFormat";
import { Trip } from "@/store/trip/privateTrip/types";
import { PropType } from "vue";
import { t } from "@/locales";

defineProps({
  trip: {
    type: Object as PropType<Trip>,
  },
  config: {
    type: Object as PropType<SetupSharebusConfig & ScheduledConfig>,
    required: true,
  },
});
</script>

<style scoped>
.reminder-panel {
  background: white;
  border: 1px solid #9f9f9f;
  border-radius: 6px;
  padding: 24px;
  font-family: "Inter", sans-serif;
  display: grid;
  gap: 24px;
}

/* Header */

.reminder-header i {
  font-size: 28px;
  color: #138340;
}

.reminder-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

/* Content */

.reminder-time strong {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  white-space: nowrap;
}

/* Info Notice */
.info-notice {
  background: #e7f3fe;
  border-radius: 4px;
  min-height: 56px;
}

.info-notice i {
  font-size: 24px;
  color: #3182ce;
  margin-top: 2px;
  flex-shrink: 0;
}

.info-notice p {
  font-size: 18px;
  line-height: 1.5;
  color: #0c1026;
  margin: 0;
}
</style>
