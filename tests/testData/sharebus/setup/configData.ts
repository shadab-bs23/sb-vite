export const mockConfigResponse = {
  BusCapacity: 50,
  MinimumPassengerGoal: 10,
  DefaultPassengerGoal: 25,
  EarlyBirdSeatNumber: 10,
  TicketPriceVatRate: 12,
  TicketPriceLogic: {
    ticket_price_logic: {
      if: [
        { "==": [{ var: "discount_scheme" }, "EARLY_BIRD"] },
        {
          "-": [
            {
              round: { "/": [{ var: "bus_price" }, { var: "passenger_goal" }] },
            },
            {
              round: {
                "*": [
                  {
                    round: {
                      "/": [{ var: "bus_price" }, { var: "passenger_goal" }],
                    },
                  },
                  { "/": [{ var: "early_bird_discount" }, 100] },
                ],
              },
            },
          ],
        },
        { "==": [{ var: "discount_scheme" }, "CUT_PRICE"] },
        {
          if: [
            {
              "<": [
                {
                  round: {
                    "*": [
                      {
                        round: {
                          "/": [
                            { var: "bus_price" },
                            { var: "passenger_goal" },
                          ],
                        },
                      },
                      {
                        "/": [
                          { "-": [100, { var: "cut_price_discount" }] },
                          100,
                        ],
                      },
                    ],
                  },
                },
                { var: "cut_price_ticket_minimum_value" },
              ],
            },
            { var: "cut_price_ticket_minimum_value" },
            {
              round: {
                "*": [
                  {
                    round: {
                      "/": [{ var: "bus_price" }, { var: "passenger_goal" }],
                    },
                  },
                  { "/": [{ "-": [100, { var: "cut_price_discount" }] }, 100] },
                ],
              },
            },
          ],
        },
        { "==": [{ var: "discount_scheme" }, "NONE"] },
        { round: { "/": [{ var: "bus_price" }, { var: "passenger_goal" }] } },
      ],
    },
    club_share_per_extra_ticket_logic: {
      if: [
        { "==": [{ var: "discount_scheme" }, "EARLY_BIRD"] },
        {
          "*": [
            {
              round: { "/": [{ var: "bus_price" }, { var: "passenger_goal" }] },
            },
            { var: "club_bonus_share" },
          ],
        },
        { "==": [{ var: "discount_scheme" }, "CUT_PRICE"] },
        {
          "*": [
            {
              round: {
                "*": [
                  {
                    round: {
                      "/": [{ var: "bus_price" }, { var: "passenger_goal" }],
                    },
                  },
                  { "/": [{ "-": [100, { var: "cut_price_discount" }] }, 100] },
                ],
              },
            },
            { var: "club_bonus_share" },
          ],
        },
        { "==": [{ var: "discount_scheme" }, "NONE"] },
        {
          "*": [
            {
              round: { "/": [{ var: "bus_price" }, { var: "passenger_goal" }] },
            },
            { var: "club_bonus_share" },
          ],
        },
      ],
    },
    price_for_subsidizing_logic: {
      if: [
        { "==": [{ var: "discount_scheme" }, "EARLY_BIRD"] },
        {
          "*": [
            {
              "*": [
                {
                  round: {
                    "/": [{ var: "bus_price" }, { var: "passenger_goal" }],
                  },
                },
                { "/": [{ var: "early_bird_discount" }, 100] },
              ],
            },
            { var: "early_bird_seat_number" },
          ],
        },
        { "==": [{ var: "discount_scheme" }, "CUT_PRICE"] },
        {
          "*": [
            {
              "-": [
                {
                  round: {
                    "/": [{ var: "bus_price" }, { var: "passenger_goal" }],
                  },
                },
                {
                  round: {
                    "*": [
                      {
                        round: {
                          "/": [
                            { var: "bus_price" },
                            { var: "passenger_goal" },
                          ],
                        },
                      },
                      {
                        "/": [
                          { "-": [100, { var: "cut_price_discount" }] },
                          100,
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            { var: "bus_capacity" },
          ],
        },
      ],
    },
  },
  CutPriceDiscountLimit: 30,
};
