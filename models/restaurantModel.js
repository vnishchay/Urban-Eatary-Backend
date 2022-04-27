const mongoose = require("mongoose");
const Food = require("./foodModel");

const restaurantSchema = new mongoose.Schema(
  {
    name: String,
    phoneNumber: {
      type: String,
      unique: true
    },
    address: String
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// restaurantSchema.pre('save', true, function (next) {
//   if (this.phoneNumber.length != 10) {
//     return next(new Error("Phone Number must be of Length 10"))
//   }
//   console.log("Going to next");
// })

restaurantSchema.virtual("restaurantFoods", {
  ref: "Food",
  localField: "_id",
  foreignField: "restaurant",
});

const Restaurant = mongoose.model(
  "Restaurant",
  restaurantSchema,
  "Restaurant Model"
);

module.exports = Restaurant;
