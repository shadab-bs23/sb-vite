import { utcToZonedTime } from "date-fns-tz";
import { format as formatDateFns } from "date-fns";
import { nb, sv, da, enUS } from "date-fns/locale";

const localeMap: Record<string, Locale> = {
  "en-US": enUS,
  "no-NO": nb,
  "sv-SE": sv,
  "da-DK": da,
};

/**
 * Predefined date/time format patterns for consistent formatting across the application.
 *
 * This enum serves multiple purposes:
 * - **Type Safety**: Prevents invalid format strings that could cause runtime errors
 * - **IntelliSense Support**: Provides auto-completion and prevents typos
 * - **Consistency**: Ensures uniform date formatting across the entire application
 * - **Maintainability**: Central place to manage and update format patterns
 * - **Validation**: Restricts format options to tested, valid date-fns patterns
 *
 * @example
 * ```typescript
 *
 * // Using type literals (for flexibility)
 * formatInCompanyTimezone(date, "dd.MM.yyyy");
 *
 * // Prevents invalid formats at compile time
 * formatInCompanyTimezone(date, "invalid-format"); // ❌ TypeScript error
 *
 * // Prevents common mistakes like using 'mm' for month
 * formatInCompanyTimezone(date, "dd.mm.yyyy"); // ❌ Not available in enum/type
 * ```
 *
 * @remarks
 * Using string literals as both keys and values allows direct usage while maintaining
 * type safety. Each format pattern follows date-fns formatting conventions:
 * - `dd` = day of month (01-31)
 * - `MM` = month (01-12)
 * - `yyyy` = 4-digit year
 * - `HH` = hour in 24-hour format (00-23)
 * - `mm` = minutes (00-59)
 */
export type AllowedFormats =
  | "dd.MM.yyyy HH:mm"
  | "dd.MM.yyyy"
  | "dd-MM-yyyy HH:mm"
  | "dd-MM-yyyy"
  | "HH:mm"
  | "dd/MM/yyyy HH:mm"
  | "EEEE, dd.MM.yyyy"
  | "EEE, dd.MM.yyyy"
  | "EEEE, dd.MM.yyyy HH:mm"
  | "EEEE, yyyy.MM.dd HH:mm"
  | "EEEE, yyyy.MM.dd"
  | "EEE, yyyy.MM.dd"
  | "EEE, yyyy.MM.dd HH:mm"
  | "EEE, dd.MM.yyyy HH:mm"
  | "EEE, MMM d, yyyy"
  | "EEEE, MMMM d, yyyy"
  | "MMMM do, yyyy"
  | "yyyy.dd.MM HH:mm"
  | "yyyy:dd:MM";

export type SupportedLocale = keyof typeof localeMap;

/**
 * Converts and formats a date/time value to a string in the specified company timezone with locale support.
 *
 * This function automatically handles Daylight Saving Time (DST) transitions using the
 * date-fns-tz library and IANA timezone identifiers. It converts any input date to the
 * target timezone and formats it according to the specified pattern and locale.
 *
 * @param date - The date/time value to convert. Can be a Date object, ISO string,
 *               timestamp number, or null/undefined
 * @param formatStr - The output format pattern following date-fns conventions.
 *                   Must be one of the predefined `AllowedFormats` for type safety.
 *                   **Available patterns:**
 *                   - `"dd.MM.yyyy HH:mm"` → `"25.09.2025 10:46"` (default)
 *                   - `"dd.MM.yyyy"` → `"25.09.2025"`
 *                   - `"dd-MM-yyyy HH:mm"` → `"2025-09-25 10:46"`
 *                   - `"dd-MM-yyyy"` → `"2025-09-25"`
 *                   - `"HH:mm"` → `"10:46"`
 *                   - `"dd/MM/yyyy HH:mm"` → `"25/09/2025 10:46"`
 *                   - `"EEEE, dd.MM.yyyy"` → `"Wednesday, 25.09.2025"` (English) / `"onsdag, 25.09.2025"` (Norwegian)
 *                   - `"EEE, dd.MM.yyyy"` → `"Wed, 25.09.2025"` (English) / `"onsdag, 25.09.2025"` (Norwegian)
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
 * @param companyTimezone - The IANA timezone identifier (default: 'Europe/Oslo').
 *                         Supports full timezone names with automatic DST handling
 * @param locale - The locale identifier for text formatting (default: 'en-US').
 *                Supported locales: 'en-US', 'no-NO', 'sv-SE', 'da-DK'
 *
 * @returns Formatted date string in the company timezone with locale-specific text, or empty string if input is invalid
 *
 * @example
 * ```typescript
 * // Convert UTC date to Oslo time with default English locale
 * convertDateIntoCompanyTimezone("2025-09-25T08:46:00Z", "EEEE, MMMM d, yyyy");
 * // Returns: "Wednesday, September 25, 2025"
 *
 * // Same date with Norwegian locale
 * convertDateIntoCompanyTimezone("2025-09-25T08:46:00Z", "EEEE, MMMM d, yyyy", "Europe/Oslo", "no-NO");
 * // Returns: "onsdag, september 25, 2025"
 *
 * // Swedish locale with different timezone
 * convertDateIntoCompanyTimezone(new Date(), "EEE, MMM d, yyyy", "Europe/Stockholm", "sv-SE");
 * // Returns: "ons sep. 25, 2025"
 * ```
 *
 * @remarks
 * - Automatically handles DST transitions for the specified timezone
 * - Input dates are assumed to be in UTC or local system timezone
 * - Invalid dates return empty string instead of throwing errors
 * - Uses date-fns-tz for robust timezone conversion
 * - Supports localized day and month names for supported locales
 * - Defaults to English (en-US) locale if no locale is specified
 */
export function convertDateIntoCompanyTimezone(
  date: Date | string | number | null | undefined,
  formatStr: AllowedFormats = "dd.MM.yyyy HH:mm",
  companyTimezone = "Europe/Oslo",
  locale: SupportedLocale = "en-US"
): string {
  if (!date) return "";
  let d: Date;
  if (typeof date === "string" || typeof date === "number") {
    d = new Date(date);
    if (isNaN(d.getTime())) return "";
  } else {
    d = date;
  }
  const zoned = utcToZonedTime(d, companyTimezone);
  const localeObj = localeMap[locale] || localeMap["en-US"];
  return formatDateFns(zoned, formatStr, { locale: localeObj });
}
