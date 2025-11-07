export interface URIState {
  country?: string;
  tabindex?: number;
  search?: string;
  operator?: string;
}

export type CountryInfo = {
  name: string;
  currency: string;
};

export type CountryMap = Record<string, CountryInfo>;