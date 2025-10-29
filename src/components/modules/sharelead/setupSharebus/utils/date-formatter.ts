/**
 * A utility function to safely format dates or date strings for the API
 * Handles both Date objects and string inputs, returning a properly formatted date string
 * or empty string if input is invalid
 */
export function safeFormatDate(date: string | Date | null | undefined): string {
  if (!date) {
    return "";
  }

  try {
    // If it's already a string, try to create a Date and format it
    if (typeof date === "string") {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return date; // Return the original string if can't convert
      }
      return dateObj.toISOString().replace(/\.\d{3}/, "");
    }

    // If it's a Date object
    if (date instanceof Date) {
      return date.toISOString().replace(/\.\d{3}/, "");
    }

    // Fallback
    return "";
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
