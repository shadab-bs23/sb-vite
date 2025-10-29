import { Trip } from "../trip/privateTrip/types";
import { JoinerTicket } from "./types";

export const setInitTickets = (trip: Trip): JoinerTicket => {
  const hasEarlyBird = trip.available_earlybird_tickets > 0;
  const hasRegualrTickets = trip.available_regular_tickets > 0;
  return {
    tripId: trip.id,
    earlyBirdTickets: {
      count: hasEarlyBird ? 1 : 0,
      price: trip.earlybird_ticket_price,
    },
    regularTickets: {
      count: !hasEarlyBird && hasRegualrTickets ? 1 : 0,
      price: trip.regular_ticket_price,
    },
  };
};
