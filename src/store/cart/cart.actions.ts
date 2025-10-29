import useJoinerTripStore from "../trip/joiner/joinerTrip.store";
import { Trip } from "../trip/privateTrip/types";
import { setInitTickets } from "./cart.utils";
import { JoinerTicket, StoreContext } from "./types";

export default {
  setJoinerTickets(this: StoreContext, ticket: JoinerTicket, isSave = true) {
    if (isSave) {
      this.tickets = [ticket];
    } else {
      this.tickets[0] = ticket;
    }
  },

  setJoinerTicketsByTripId(
    this: StoreContext,
    ticket: JoinerTicket,
    trip: Trip
  ) {
    let ticketObj = this.tickets[0];
    if (ticketObj && ticketObj.tripId === trip.id) {
      ticketObj = { ...ticketObj, ...ticket };
      this.tickets[0] = ticketObj;
    } else {
      const joinerStore = useJoinerTripStore();
      joinerStore.setCurrentStep(1);
      this.tickets[0] = setInitTickets(trip);
    }
  },

  /**
   * getting joiner earlybird ticket  count
   */
  getJoinerTickets(this: StoreContext, trip: Trip): JoinerTicket {
    let joinerTickets = this.tickets[0];

    if (!joinerTickets) {
      joinerTickets = setInitTickets(trip);
    }
    return joinerTickets;
  },

  /**
   * remove joiner tickets after booking
   */
  removeJoinerTickets(this: StoreContext, tripId: string) {
    this.tickets = this.tickets.filter((tc) => tc.tripId !== tripId);
  },

  /**
   * getting joiner total ticket count
   */
  getJoinerTotalTickets(this: StoreContext, trip: Trip): number {
    let joinerTickets = this.tickets[0];

    if (!joinerTickets) {
      joinerTickets = setInitTickets(trip);
    }
    return (
      joinerTickets.earlyBirdTickets.count + joinerTickets.regularTickets.count
    );
  },

  /*
   * getting joiner tickets for a trip if exist.
   */
  getJoinerTicketsExist(this: StoreContext) {
    return this.tickets[0];
  },

  getJoinerTotalTicketPrice(this: StoreContext, trip: Trip): number {
    let joinerTickets = this.tickets[0];

    if (!joinerTickets) {
      joinerTickets = setInitTickets(trip);
    }
    return (
      joinerTickets.earlyBirdTickets.price + joinerTickets.regularTickets.price
    );
  },
};
