export interface jsonLogicResult {
  ticketPrice: number;
  deductibleAmount?: number;
  bonus: number;
}

export type TypeLogicBase = {
  bus_price: number;
  passenger_goal: number;
  discount_scheme: string;
};

export interface TypeLogicEarlyBirdDiscount extends TypeLogicBase {
  early_bird_discount: number;
  early_bird_seat_number: number;
  club_bonus_share: number;
}
export interface TypeLogicCutPriceDiscount extends TypeLogicBase {
  cut_price_discount: number;
  club_bonus_share: number;
  bus_capacity: number;
}

export interface TypeLogicNoDiscount extends TypeLogicBase {
  club_bonus_share: number;
}

export interface TypeLogicEarlyBirdTicket extends TypeLogicBase {
  early_bird_discount: number;
}
export interface TypeLogicCutPriceTicket extends TypeLogicBase {
  cut_price_discount: number;
}

export interface TypeLogicSubsidizingEarlyBird extends TypeLogicBase {
  early_bird_discount: number;
  early_bird_seat_number: number;
}
export interface TypeLogicSubsidizingCutPrice extends TypeLogicBase {
  cut_price_discount: number;
  bus_capacity: number;
}

export interface TypeLogicClubShareBase extends TypeLogicBase {
  club_bonus_share: number;
  passenger_goal: number;
}
export interface TypeLogicClubShareCutPrice extends TypeLogicClubShareBase {
  cut_price_discount: number;
}
