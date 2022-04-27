const fs = require("fs");
const mongoose = require("mongoose");
const Food = require("./../models/foodModel");
const Restaurant = require("./../models/restaurantModel");

const DB = "mongodb+srv://nishi:TyeYEOOlJSEkeY32@cluster0.zjfve.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

// READ JSON FILE
const breakfast = JSON.parse(
  fs.readFileSync(`${__dirname}/breakfast.json`, "utf-8")
);
const burger = JSON.parse(fs.readFileSync(`${__dirname}/burger.json`, "utf-8"));
const dinner = JSON.parse(fs.readFileSync(`${__dirname}/dinner.json`, "utf-8"));
const drinks = JSON.parse(fs.readFileSync(`${__dirname}/drinks.json`, "utf-8"));
const icecream = JSON.parse(
  fs.readFileSync(`${__dirname}/icecream.json`, "utf-8")
);
const pizza = JSON.parse(fs.readFileSync(`${__dirname}/pizza.json`, "utf-8"));
const sandwich = JSON.parse(
  fs.readFileSync(`${__dirname}/sandwich.json`, "utf-8")
);
const restaurant = JSON.parse(
  fs.readFileSync(`${__dirname}/restaurant.json`, "utf-8")
);
const shawarma = JSON.parse(
  fs.readFileSync(`${__dirname}/shawarma.json`, "utf-8")
);
const lunch = JSON.parse(
  fs.readFileSync(`${__dirname}/lunch.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Food.create(breakfast);
    await Food.create(burger);
    await Food.create(dinner);
    await Food.create(drinks);
    await Food.create(icecream);
    await Food.create(pizza);
    await Food.create(sandwich);
    await Food.create(shawarma);
    await Food.create(lunch);
    // await Restaurant.create(restaurant);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Food.deleteMany();
    await Restaurant.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
