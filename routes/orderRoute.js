const express = require('express');
const orderController = require('./../controller/orderController');
const authController = require('./../controller/authController');

const router = express.Router();

router.use(authController.protect);
router.post('/placeOrder', orderController.placeOrder);
router.get('/cancelOrder/:orderId', orderController.cancelOrder);
router.get('/pastOrders', orderController.pastOrders);
router.get('/allOrders', orderController.getAllOrders);

module.exports = router;
