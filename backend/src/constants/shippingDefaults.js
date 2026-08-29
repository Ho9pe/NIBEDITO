// The shipping regions a fresh database starts with.
//
// Shared by the admin "initialize default rates" endpoint and the development
// seed. It lives here for the same reason validationRules.js does: the list was
// about to exist in two places, and this project has already produced the same
// bug three times from one rule written twice and then drifting.
//
// Region names are matched case-insensitively by ShippingRate.findByRegion, and
// an order stores the name rather than a reference - so renaming a region here
// does not rewrite the orders that already quote it.

const DEFAULT_SHIPPING_RATES = [
  {
    region: "Inside Dhaka",
    cost: 60,
    description: "Delivery within Dhaka city",
  },
  {
    region: "Inside Chittagong",
    cost: 80,
    description: "Delivery within Chittagong city",
  },
  {
    region: "Outside Dhaka & Chittagong",
    cost: 120,
    description: "Delivery to all other locations",
  },
];

module.exports = { DEFAULT_SHIPPING_RATES };
