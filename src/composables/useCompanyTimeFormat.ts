import { ComputedRef, inject } from "vue";
import { countryType } from "@/core/plugin/countryPlugin";
import {
  AllowedFormats,
  SupportedLocale,
  convertDateIntoCompanyTimezone,
} from "@/utils/companyTimeFormat";

/**
 * Provides a function to format dates according to the company's timezone and preferred format.
 *
 * This composable automatically injects the current country context and uses its timezone
 * for consistent date formatting across the application. It leverages the underlying
 * `convertDateIntoCompanyTimezone` utility with automatic DST handling.
 *
 * @returns A function that formats dates using the company's timezone and specified format patterns
 *
 * @example
 * ```typescript
 * // In a Vue component
 * const formatInCompanyTimezone = useCompanyTimeFormat();
 *
 * // Format current time in company timezone
 * formatInCompanyTimezone(new Date(), "dd.MM.yyyy HH:mm");
 * // Returns: "04.09.2025 10:55" (in Oslo timezone)
 *
 * // Format with different patterns
 * formatInCompanyTimezone(new Date(), "EEE, MMM d, yyyy");
 * // Returns: "Thu, Sep 4, 2025"
 *
 * // Handle ISO strings automatically
 * formatInCompanyTimezone("2025-09-25T08:46:00Z", "dd.MM.yyyy HH:mm");
 * // Returns: "25.09.2025 10:46" (converted from UTC to Oslo time)
 * ```
 */
export function useCompanyTimeFormat() {
  const country = inject<ComputedRef<countryType>>("country");

  /**
   * Formats a date/time value to a string in the company's timezone using the specified format pattern.
   *
   * This function automatically handles timezone conversion and Daylight Saving Time (DST) transitions
   * by using the injected country context or defaulting to Europe/Oslo timezone. It provides type-safe
   * formatting with predefined patterns and graceful error handling.
   *
   * @param date - The date/time value to format. Accepts multiple input types:
   *               - **Date object**: `new Date()` or existing Date instances
   *               - **ISO string**: `"2025-09-25T08:46:00Z"` (automatically parsed)
   *               - **Timestamp**: `1727254800000` (milliseconds since epoch)
   *               - **null/undefined**: Returns empty string gracefully
   *
   * @param formatStr - The output format pattern following date-fns conventions.
   *                   Must be one of the predefined `AllowedFormats` for type safety.
   *                   **Available patterns:**
   *                   - `"dd.MM.yyyy HH:mm"` → `"25.09.2025 10:46"` (default)
   *                   - `"dd.MM.yyyy"` → `"25.09.2025"`
   *                   - `"dd-MM-yyyy HH:mm"` → `"2025-09-25 10:46"`
   *                   - `"dd-MM-yyyy"` → `"2025-09-25"`
   *                   - `"HH:mm"` → `"10:46"`
   *                   - `"dd/MM/yyyy HH:mm"` → `"25/09/2025 10:46"`
   *                   - `"EEE, dd.MM.yyyy"` → `"Wed, 25.09.2025"` (English) / `"onsdag, 25.09.2025"` (Norwegian)
   *                   - `"EEEE, dd.MM.yyyy"` → `"Wednesday, 25.09.2025"` (English) / `"onsdag, 25.09.2025"` (Norwegian)
   *                   - `"EEEE, dd.MM.yyyy HH:mm"` → `"Wednesday, 25.09.2025 10:46"` (English) / `"onsdag, 25.09.2025 10:46"` (Norwegian)
   *                   - `"EEEE, yyyy.MM.dd HH:mm"` → `"Wednesday, 2025.09.25 10:46"` (English) / `"onsdag, 2025.09.25 10:46"` (Norwegian)
   *                   - `"EEEE, yyyy.MM.dd"` → `"Wednesday, 2025.09.25"` (English) / `"onsdag, 2025.09.25"` (Norwegian)
   *                   - `"EEE, yyyy.MM.dd"` → `"Wed, 2025.09.25"` (English) / `"ons, 2025.09.25"` (Norwegian)
   *                   - `"EEE, yyyy.MM.dd HH:mm"` → `"Wed, 2025.09.25 10:46"` (English) / `"ons, 2025.09.25 10:46"` (Norwegian)
   *                   - `"EEE, MMM d, yyyy"` → `"Wed, Sep 25, 2025"` (English) / `"ons, sep. 25, 2025"` (Norwegian)
   *                   - `"EEEE, MMMM d, yyyy"` → `"Wednesday, September 25, 2025"` (English) / `"onsdag, september 25, 2025"` (Norwegian)
   *                   - `"MMMM do, yyyy"` → `"September 25th, 2025"` (English) / `"september 25., 2025"` (Norwegian)
   *                   - `"yyyy.dd.MM HH:mm"` → `"2025.25.09 10:46"`
   *                   - `"yyyy:dd:MM"` → `"2025:25:09"`
   *
   * @param locale - The locale identifier for text formatting (optional, default: 'en-US').
   *                Supported locales: 'en-US', 'no-NO', 'sv-SE', 'da-DK'
   *
   * @returns Formatted date string in the company's timezone, or empty string if input is invalid
   *
   * @example
   * ```typescript
   * // Basic usage with default format and locale
   * const formatted = formatInCompanyTimezone(new Date());
   * // Returns: "04.09.2025 10:55"
   *
   * // Different format patterns with localized text
   * formatInCompanyTimezone(new Date(), "EEE, MMM d, yyyy");
   * // Returns: "Thu, Sep 4, 2025" (English)
   *
   * formatInCompanyTimezone(new Date(), "EEE, MMM d, yyyy", "no-NO");
   * // Returns: "tor, sep. 4, 2025" (Norwegian)
   *
   * formatInCompanyTimezone(new Date(), "HH:mm");
   * // Returns: "10:55"
   *
   * // UTC to company timezone conversion with locale
   * formatInCompanyTimezone("2025-09-25T08:46:00Z", "EEEE, MMMM d, yyyy", "sv-SE");
   * // Returns: "onsdag, september 25, 2025" (Swedish)
   *
   * // Timestamp conversion
   * formatInCompanyTimezone(1727254800000, "dd-MM-yyyy");
   * // Returns: "2025-09-25"
   *
   * // Graceful error handling
   * formatInCompanyTimezone(null, "dd.MM.yyyy");
   * // Returns: ""
   *
   * formatInCompanyTimezone("invalid-date", "dd.MM.yyyy");
   * // Returns: ""
   * ```
   *
   * @remarks
   * - **Timezone Detection**: Automatically uses injected country timezone or defaults to "Europe/Oslo"
   * - **DST Handling**: Automatically handles Daylight Saving Time transitions
   * - **Type Safety**: Only accepts predefined format patterns to prevent runtime errors
   * - **Locale Support**: Supports localized text formatting with optional locale parameter (defaults to 'en-US')
   * - **Error Handling**: Returns empty string for invalid dates instead of throwing errors
   * - **Performance**: Leverages date-fns-tz for efficient timezone conversion
   * - **Consistency**: Ensures uniform date formatting across the entire application
   *
   * @see {@link convertDateIntoCompanyTimezone} - The underlying utility function
   * @see {@link AllowedFormats} - Available format patterns with type safety
   */
  function formatDateInCompanyTimezone(
    date: Date | string | number | null | undefined,
    formatStr: AllowedFormats = "dd.MM.yyyy HH:mm",
    locale: SupportedLocale = "en-US"
  ): string {
    const timezone = country?.value?.timezone || "Europe/Oslo";
    return convertDateIntoCompanyTimezone(date, formatStr, timezone, locale);
  }

  return formatDateInCompanyTimezone;
}
