/**
 * Common types for ticket booking components
 */

/**
 * Basic ticket item used for displaying and selecting tickets
 */
export interface TicketItem {
  categoryName: string;
  quantity: number;
  price: number;
}

/**
 * Extended ticket holder information with personal details
 * Note: 'count' in TicketHolder corresponds to 'quantity' in TicketItem
 */
export interface TicketHolder {
  id: string;
  categoryName: string;
  count: number; // This corresponds to quantity=1 for each individual ticket holder
  price: number;
  route: string;
  name?: string;
  email?: string;
  phone?: string;
  copyToAll?: boolean;
}

/**
 * Props for the TicketHolderItem component
 */
export interface TicketHolderProps {
  ticket: TicketHolder;
  index: number;
  disabledCopy?: boolean;
}

/**
 * Checkout information structure
 * Contains essential trip data needed for the checkout process
 */
export interface CheckoutInfo {
  id: string;
  name: string;
  booking_reference: string;
  updated_at: string;
}
