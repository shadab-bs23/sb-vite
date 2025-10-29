type TicketDiscount = {
  days: number;
  percent: number;
};

/**
 * Validates ticket discount data structure
 * @param ticketDiscounts Array of discount rules to validate
 * @throws Error if discount data is invalid
 */
function validateDiscountData(ticketDiscounts: TicketDiscount[]): void {
  for (const discount of ticketDiscounts) {
    if (typeof discount.days !== "number" || discount.days < 0) {
      throw new Error(
        `Invalid discount days: ${discount.days}. Must be a non-negative number.`
      );
    }
    if (
      typeof discount.percent !== "number" ||
      discount.percent < 0 ||
      discount.percent > 100
    ) {
      throw new Error(
        `Invalid discount percent: ${discount.percent}. Must be a number between 0 and 100.`
      );
    }
  }
}

/**
 * Find which discount percent is eligible based on departure date
 * @param ticketDiscounts Array of discount rules
 * @param departureDate Departure date (ISO string)
 * @returns Eligible discount percent or 0 if none
 */
export function getEligibleDiscount(
  ticketDiscounts: TicketDiscount[],
  departureDate: string | null
): number {
  // Validate input parameters
  if (!departureDate || typeof departureDate !== "string") {
    console.error("Departure date must be a valid string");
    return 0;
  }

  if (
    !ticketDiscounts ||
    !Array.isArray(ticketDiscounts) ||
    ticketDiscounts.length === 0
  ) {
    console.error("Ticket discounts must be a non-empty array");
    return 0;
  }

  // Validate discount data structure
  validateDiscountData(ticketDiscounts);

  const today = new Date();
  const departureDt = new Date(departureDate);

  // Validate departureDt is a valid date
  if (isNaN(departureDt.getTime())) {
    console.error(`Invalid departure date: ${departureDate}`);
    return 0;
  }

  // Check if departure date is in the past
  if (departureDt < today) {
    console.error("Departure date cannot be in the past");
    return 0;
  }

  // Calculate difference in days
  const daysDiff = Math.abs(
    Math.floor(
      (departureDt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  // Sort discounts by days ascending
  const sortedDiscounts = [...ticketDiscounts].sort((a, b) => a.days - b.days);

  // Find first discount where daysDiff <= discount.days
  for (const discount of sortedDiscounts) {
    if (daysDiff <= discount.days) {
      return discount.percent;
    }
  }

  return 0; // No discount applies
}

/**
 * Validates departure date and discount data
 * @param departureDate Departure date (ISO string)
 * @param ticketDiscounts Array of discount rules
 * @returns Object with validation results
 */
export function validateDiscountInput(
  departureDate: string,
  ticketDiscounts: TicketDiscount[]
): { isValid: boolean; errors: string[]; departureDt?: Date } {
  const errors: string[] = [];

  // Validate departure date
  if (!departureDate || typeof departureDate !== "string") {
    errors.push("Departure date must be a valid string");
  }

  let departureDt: Date | undefined;
  if (departureDate) {
    departureDt = new Date(departureDate);
    if (isNaN(departureDt.getTime())) {
      errors.push(`Invalid departure date: ${departureDate}`);
    } else {
      const today = new Date();
      if (departureDt < today) {
        errors.push("Departure date cannot be in the past");
      }
    }
  }

  // Validate discount data
  if (!ticketDiscounts || !Array.isArray(ticketDiscounts)) {
    errors.push("Ticket discounts must be an array");
  } else if (ticketDiscounts.length === 0) {
    errors.push("Ticket discounts array cannot be empty");
  } else {
    try {
      validateDiscountData(ticketDiscounts);
    } catch (error) {
      errors.push((error as Error).message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    departureDt: errors.length === 0 ? departureDt : undefined,
  };
}
