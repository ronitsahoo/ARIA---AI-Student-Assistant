const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');

// Initialize Razorpay (Test Mode)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private (Student)
const createOrder = asyncHandler(async (req, res) => {
    const { amount } = req.body; // Amount in INR

    if (!amount) {
        res.status(400);
        throw new Error('Please provide amount');
    }

    const options = {
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
        notes: {
            student_id: req.user._id.toString(),
            student_name: req.user.name,
            purpose: 'Tuition Fee Payment'
        }
    };

    try {
        const order = await razorpay.orders.create(options);
        console.log('✅ Razorpay Order Created:', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            student: req.user.name
        });
        res.json(order);
    } catch (error) {
        console.error('❌ Razorpay Order Creation Failed:', error);
        res.status(500);
        throw new Error('Something went wrong with Razorpay order creation');
    }
});

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private (Student)
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update database
        const profile = await StudentProfile.findOne({ userId: req.user._id });

        if (profile) {
            // Get order details to extract amount
            const order = await razorpay.orders.fetch(razorpay_order_id);
            const paidAmount = order.amount / 100; // Convert paise to rupees

            profile.fee.status = 'paid';
            profile.fee.paidAmount = (profile.fee.paidAmount || 0) + paidAmount;
            profile.fee.transactionId = razorpay_payment_id;
            profile.fee.orderId = razorpay_order_id;
            profile.fee.signature = razorpay_signature;
            
            // Add to payment history
            if (!profile.fee.history) {
                profile.fee.history = [];
            }
            profile.fee.history.push({
                amount: paidAmount,
                date: new Date(),
                transactionId: razorpay_payment_id,
                orderId: razorpay_order_id
            });

            // Update status based on remaining amount
            const remaining = profile.fee.totalAmount - profile.fee.paidAmount;
            if (remaining <= 0) {
                profile.fee.status = 'paid';
            } else {
                profile.fee.status = 'partial';
            }

            await profile.save();

            console.log('✅ Payment Verified Successfully:', {
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                amount: paidAmount,
                student: req.user.name,
                remaining: remaining > 0 ? remaining : 0
            });

            res.json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                amount: paidAmount,
                remaining: remaining > 0 ? remaining : 0
            });
        } else {
            res.status(404);
            throw new Error('Profile not found');
        }
    } else {
        console.error('❌ Payment Signature Verification Failed:', {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            expected: expectedSignature,
            received: razorpay_signature
        });
        res.status(400);
        throw new Error('Invalid signature');
    }
});

module.exports = {
    createOrder,
    verifyPayment
};
