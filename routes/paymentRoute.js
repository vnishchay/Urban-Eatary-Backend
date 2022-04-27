const express = require('express');
const paymentController = require('./../controller/paymentController');
const router = express.Router();

router.post('/payment', paymentController.stripePayment);

module.exports = router;
