const { Schema, model } = require("mongoose");

const shippingRateSchema = new Schema(
  {
    region: {
      type: String,
      required: true,
      trim: true,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Find by region name (case-insensitive)
shippingRateSchema.statics.findByRegion = function (regionName) {
  return this.findOne({
    region: { $regex: new RegExp("^" + regionName + "$", "i") },
  });
};

// Region index (MOST CRITICAL - used for findByRegion)
shippingRateSchema.index({ region: 1 }, { unique: true });

const ShippingRate = model("ShippingRate", shippingRateSchema);
module.exports = ShippingRate;
