const express = require('express');
const foodController = require('./../controller/foodController');
const authController = require('./../controller/authController');

const router = express.Router();

// router.use(authController.protect);
router.get('/foodItem', foodController.getAllFoods);
router.get('/foodItem/:id', foodController.getFoodById);
router.get('/getFoodbyCategory/:category', foodController.getFoodbyCategory);
router.get('/search/:keyword', foodController.searchFood);

router.use(authController.restrictTo('restaurant', 'admin'));
router.post('/foodItem', foodController.createItem);
router.patch('/foodItem/:id', foodController.updateItemById);
router.delete('/foodItem/:id', foodController.deleteItem);
router.post('/mapRestaurant', foodController.mapFoodRestaurant);

module.exports = router;
