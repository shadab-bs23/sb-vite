import { roundPriceWithDecimals } from "./cart.utils";
import { TicketItem, StoreContext, FormattedTicket } from "./types";

export default {
  setTripId(this: StoreContext, tripId: string) {
    this.tripId = tripId;
  },

  setSelectedViaPointId(this: StoreContext, viaPointId: number) {
    this.selectedViaPointId = viaPointId;
  },

  addTicket(this: StoreContext, ticket: TicketItem) {
    const existingTicketIndex = this.tickets.findIndex(
      (t) => t.categoryName === ticket.categoryName
    );

    if (existingTicketIndex >= 0) {
      // Replace existing ticket completely (don't accumulate)
      this.tickets[existingTicketIndex] = { ...ticket };
    } else {
      // Add new ticket
      this.tickets.push({ ...ticket });
    }

    this.calculateTotalPrice();
  },

  updateTicket(this: StoreContext, categoryName: string, quantity: number) {
    const ticketIndex = this.tickets.findIndex(
      (t) => t.categoryName === categoryName
    );

    if (ticketIndex >= 0) {
      if (quantity <= 0) {
        // Remove ticket if quantity is 0 or less
        this.tickets.splice(ticketIndex, 1);
      } else {
        // Update quantity
        this.tickets[ticketIndex].quantity = quantity;
      }
      this.calculateTotalPrice();
    }
  },

  removeTicket(this: StoreContext, categoryName: string) {
    this.tickets = this.tickets.filter((t) => t.categoryName !== categoryName);
    this.calculateTotalPrice();
  },

  setEligibleDiscount(this: StoreContext, discount: number) {
    this.eligibleDiscountPercent = discount;
  },

  clearCart(this: StoreContext) {
    this.tickets = [];
    this.selectedViaPointId = null;
    this.tripId = "";
    this.formattedTickets = [];
    this.totalPayablePrice = 0;
    this.eligibleDiscountPercent = 0;
  },

  /**
   * Calculates the total payable price for all tickets in the cart and price is included discount if any.
   *
   * Iterates through the `tickets` array, multiplying each ticket's price by its quantity,
   * and sums the results to compute the total. The total is then rounded using
   * `roundPriceWithDecimals` and assigned to `totalPayablePrice`.
   *
   * @this StoreContext - The store context containing the tickets and totalPayablePrice.
   */
  calculateTotalPrice(this: StoreContext) {
    const total = this.tickets.reduce((total, ticket) => {
      return total + ticket.price * ticket.quantity;
    }, 0);
    this.totalPayablePrice = roundPriceWithDecimals(total);
  },

  // Getters
  getTotalPrice(this: StoreContext): number {
    return this.totalPayablePrice;
  },

  getTickets(this: StoreContext): TicketItem[] {
    return this.tickets;
  },

  hasItems(this: StoreContext): boolean {
    return this.tickets.length > 0;
  },

  getCartItemCount(this: StoreContext): number {
    return this.tickets.reduce((count, ticket) => count + ticket.quantity, 0);
  },

  setFormattedTickets(this: StoreContext, tickets: FormattedTicket[]) {
    this.formattedTickets = tickets;
  },

  getFormattedTickets(this: StoreContext): FormattedTicket[] {
    return this.formattedTickets;
  },
};
