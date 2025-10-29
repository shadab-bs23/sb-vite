import { format } from "date-fns";
import { useCompanyTimeFormat } from "./useCompanyTimeFormat";

export interface PriceDataItem {
  index: number;
  priceMap: Record<string, number>;
  prices?: Record<string, string>;
  pointId?: string | number;
  id?: string | number;
  [key: string]: unknown;
}

export function usePriceUtilities() {
  // Get price from price map
  const getPriceFromMap = (
    priceMap: Record<string, number>,
    categoryKey: string
  ): string => {
    const price = priceMap[categoryKey];
    return price !== undefined ? price.toString() : "";
  };

  // Handle price change in data item
  const updatePriceInDataItem = (
    dataItem: PriceDataItem,
    categoryKey: string,
    newValue: string
  ) => {
    // Update the priceMap
    if (!dataItem.priceMap) {
      dataItem.priceMap = {};
    }
    dataItem.priceMap[categoryKey] = parseFloat(newValue) || 0;

    // Also update prices object if it exists (for backward compatibility)
    if (dataItem.prices) {
      dataItem.prices[categoryKey] = newValue;
    }
  };

  // Generic price change handler
  const handlePriceChange = (
    dataItem: PriceDataItem,
    categoryKey: string,
    event: Event,
    onPriceChange?: (
      dataItem: PriceDataItem,
      categoryKey: string,
      value: string
    ) => void
  ) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    updatePriceInDataItem(dataItem, categoryKey, value);

    if (onPriceChange) {
      onPriceChange(dataItem, categoryKey, value);
    }
  };

  // Check if a price is valid
  const isValidPrice = (value: string): boolean => {
    if (!value || value.trim() === "") return false;
    const numValue = parseFloat(value.trim());
    return !isNaN(numValue) && numValue >= 0;
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    return format(new Date(date), "EEEE, dd.MM.yyyy");
  };

  // Format time for display
  const formatTime = (datetime: Date | string | undefined): string => {
    if (!datetime) return "";
    return format(new Date(datetime), "HH:mm");
  };

  // Format departure time
  const formatDepartureTime = (time: Date | string | undefined): string => {
    const convertToCompanyTime = useCompanyTimeFormat();
    if (!time) return "";
    const convertedTime = convertToCompanyTime(time, "EEE, dd.MM.yyyy HH:mm");
    return convertedTime;
  };

  // Generate API payload for ticket pricing
  const generateTicketPricingPayload = (
    dataItems: PriceDataItem[],
    categories: Array<{ name: string; enabled: boolean; key?: string }>
  ) => {
    const categoriesPayload = categories.map((category) => ({
      name: category.name,
      enabled: category.enabled,
    }));

    const viaPoints = dataItems.map((item, index) => {
      const categoryPrices: { name: string; price: number }[] = [];

      categories.forEach((category) => {
        const categoryKey = category.key || category.name;
        const priceValue = item.priceMap?.[categoryKey] || 0;

        if (category.enabled && priceValue > 0) {
          categoryPrices.push({
            name: category.name,
            price: priceValue,
          });
        }
      });

      return {
        id: String(item.pointId || item.id || index + 1),
        category_prices: categoryPrices,
      };
    });

    return {
      categories: categoriesPayload,
      via_points: viaPoints,
    };
  };

  return {
    getPriceFromMap,
    updatePriceInDataItem,
    handlePriceChange,
    isValidPrice,
    formatDate,
    formatTime,
    formatDepartureTime,
    generateTicketPricingPayload,
  };
}
