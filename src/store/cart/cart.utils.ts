import { Trip } from "../trip/privateTrip/types";
import { JoinerTicket } from "../trip/joiner/types";
import { TicketItem } from "./types";

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

// Simplified utility functions for our new TicketItem structure
export const createTicketItem = (
  categoryName: string,
  quantity: number,
  price: number
): TicketItem => ({
  categoryName,
  quantity,
  price,
});

export const calculateTicketsTotal = (tickets: TicketItem[]): number => {
  return tickets.reduce(
    (total, ticket) => total + ticket.price * ticket.quantity,
    0
  );
};

export const findTicketIndex = (
  tickets: TicketItem[],
  categoryName: string
): number => {
  return tickets.findIndex((ticket) => ticket.categoryName === categoryName);
};

export const addOrUpdateTicket = (
  tickets: TicketItem[],
  newTicket: TicketItem
): TicketItem[] => {
  const existingTicketIndex = findTicketIndex(tickets, newTicket.categoryName);
  const updatedTickets = [...tickets];

  if (existingTicketIndex >= 0) {
    // Update existing ticket
    if (newTicket.quantity > 0) {
      updatedTickets[existingTicketIndex] = newTicket;
    } else {
      // Remove ticket if quantity is 0
      updatedTickets.splice(existingTicketIndex, 1);
    }
  } else if (newTicket.quantity > 0) {
    // Add new ticket if quantity > 0
    updatedTickets.push(newTicket);
  }

  return updatedTickets;
};

/**
 * Rounds a given price to a specified number of decimal places.
 *
 * @param price - The numeric value to round.
 * @param decimals - The number of decimal places to round to (default is 2).
 * @returns The rounded price as a number.
 *
 * @example
 * roundPriceWithDecimals(12.3456); // returns 12.35
 * roundPriceWithDecimals(12.344, 1); // returns 12.3
 * roundPriceWithDecimals(12, 2; // returns 12
 */
export const roundPriceWithDecimals = (price: number, decimals = 2): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(price * factor) / factor;
};
