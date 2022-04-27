const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    address: String,
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: "Restaurant",
    },
    foodItems: [{
        itemId: {
            type: mongoose.Schema.ObjectId,
            ref: "Food",
        },
        quantity: {
            type: Number,
        }
    }],
    totalPrice: Number,
    status: {
        type: String,
        enum: ['success', 'cancelled'],
        default: 'success'
    }
});

const Order = mongoose.model("Order", orderSchema, "Order Model");

module.exports = Order;