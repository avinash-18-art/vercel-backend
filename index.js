const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Razorpay = require('razorpay');
require('dotenv').config(); 

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Razorpay instance (You can switch to .env variables)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_9ViO0p7vRG2H3h",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "i6ln8tvlorhr75TwQ31WlPzD"
});

// Routes
app.get('/', (req, res) => {
  res.send("Hello World");
});

// Create Razorpay Order
app.post("/orders", async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const options = {
    amount: Number(amount), 
    currency,
    receipt: "receipt#1",
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log("✅ Order created:", response);
    res.status(200).json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    return res.status(400).json({ message: "Payment ID required" });
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    console.error("❌ Failed to fetch payment:", error);
    res.status(500).json({ message: "Failed to fetch payment", error: error.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
