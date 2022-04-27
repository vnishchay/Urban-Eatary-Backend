const express = require("express");
const restaurantController = require("./../controller/restaurantController");
const authController = require('./../controller/authController')

const router = express.Router();

router.use(authController.protect);
router.get("/getRestaurant/:id", restaurantController.getRestaurantById);
router.get("/restaurantItems/:id", restaurantController.displayRestaurantFood);
router.get("/getAllRestaurant", restaurantController.getAllRestaurant);

router.use(authController.restrictTo('admin', 'restaurant'));
router.patch("/updateRestaurant/:id", restaurantController.updateRestaurant);

router.use(authController.restrictTo('admin'));
router.post("/createRestaurant", restaurantController.createRestaurant);
router.delete("/deleteRestaurant/:id", restaurantController.deleteRestaurant);

module.exports = router;
