# ARIA - Academic Registration Intelligence Assistant

A comprehensive student onboarding platform with integrated payment system, document management, hostel applications, and LMS activation.

## 🎯 Overview

ARIA is a full-stack MERN application designed to streamline the student onboarding process at universities. It features a beautiful, modern UI with dark mode support and includes a complete Razorpay payment integration for tuition fee management.

## ✨ Key Features

### 🎓 Student Onboarding
- **Document Upload & Verification** - Upload and track document approval status
- **Tuition Fee Payment** - Integrated Razorpay payment system with test mode
- **Hostel Application** - Apply for hostel accommodation with room preferences
- **LMS Activation** - Course registration and timetable management

### 💳 Payment System (NEW!)
- ✅ Razorpay Test Mode Integration
- ✅ Beautiful gradient UI with animations
- ✅ Test mode indicators and test card info
- ✅ Quick pay buttons (Full/Half payment)
- ✅ Custom amount input with validation
- ✅ Payment history tracking
- ✅ Partial payment support
- ✅ Dark mode support
- ✅ Real-time status updates

### 🔐 Security
- JWT Authentication with HttpOnly Cookies
- Role-based Access Control (Student, Admin, Staff)
- HMAC SHA256 payment signature verification
- Secure environment variable management

### 🎨 UI/UX
- Modern, responsive design
- Dark mode with neon accents
- Smooth animations and transitions
- Progress tracking
- Real-time notifications

## 📁 Structure

```
aria/
├── backend/              # Node.js + Express + MongoDB
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & upload middleware
│   └── .env             # Environment variables
│
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard pages
│   │   ├── context/     # State management
│   │   └── services/    # API calls
│   └── .env             # Frontend config
│
└── docs/                # Documentation
    ├── RAZORPAY_TEST_GUIDE.md
    ├── PAYMENT_DEMO_SCRIPT.md
    ├── PAYMENT_SYSTEM_README.md
    ├── PAYMENT_CHECKLIST.md
    └── IMPLEMENTATION_SUMMARY.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key

# Razorpay Test Mode
RAZORPAY_KEY_ID=rzp_test_SI2JyTvSHlj8Tb
RAZORPAY_KEY_SECRET=7nfRRk2w8pgiNTs4iVjAKZwA
```

Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend runs on: http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_SI2JyTvSHlj8Tb
```

Start the development server:
```bash
npm run dev
```

Frontend runs on: http://localhost:5173

## 💳 Testing Payments

### Test Card (Success)
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Any name
```

### Test UPI (Success)
```
success@razorpay
```

### Payment Flow
1. Login as student
2. Navigate to Fee Payment module
3. Click "Pay Full" or "Pay Half"
4. Click "💳 Pay Now"
5. Enter test card details
6. Complete payment
7. See success message and updated history

For detailed testing instructions, see [RAZORPAY_TEST_GUIDE.md](RAZORPAY_TEST_GUIDE.md)

## 📚 Documentation

- **[RAZORPAY_TEST_GUIDE.md](RAZORPAY_TEST_GUIDE.md)** - Complete testing guide with test credentials
- **[PAYMENT_DEMO_SCRIPT.md](PAYMENT_DEMO_SCRIPT.md)** - Step-by-step demo presentation script
- **[PAYMENT_SYSTEM_README.md](PAYMENT_SYSTEM_README.md)** - Technical architecture and API docs
- **[PAYMENT_CHECKLIST.md](PAYMENT_CHECKLIST.md)** - Pre-demo verification checklist
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation overview

## 🎬 Demo Guide

For hackathon/demo presentations, follow the [PAYMENT_DEMO_SCRIPT.md](PAYMENT_DEMO_SCRIPT.md) for a polished 30-second demo.

### Quick Demo Steps:
1. Show student dashboard (5s)
2. Navigate to Fee Payment (5s)
3. Show test mode & test cards (5s)
4. Initiate payment (5s)
5. Complete with test card (10s)
6. Show success & history (5s)

## 🔧 Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Razorpay SDK
- Multer (file uploads)
- Google Gemini AI

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Axios
- Context API

## 🎨 Features Showcase

### Payment Module
- 🧪 Test mode badge with pulse animation
- 💳 Expandable test card information
- 🎨 Beautiful gradient cards
- ⚡ Animated quick pay buttons
- 💰 Custom amount input with validation
- ✅ Icon-based payment history
- 🎊 Success animations
- 🌙 Full dark mode support

### Dashboard
- 📊 Progress tracking
- 🔔 Real-time notifications
- 🌓 Theme toggle (light/dark)
- 📱 Fully responsive
- ⚡ Smooth animations

## 🔐 Security Features

- Environment variables for sensitive data
- JWT token authentication
- HMAC SHA256 signature verification
- Protected API routes
- Secure file upload handling
- Input validation and sanitization

## 🚀 Production Deployment

### Checklist
- [ ] Get live Razorpay API keys
- [ ] Update environment variables
- [ ] Remove test mode indicators
- [ ] Set up webhooks
- [ ] Configure CORS for production domain
- [ ] Set up SSL/HTTPS
- [ ] Configure MongoDB Atlas
- [ ] Set up monitoring and logging

For detailed production guide, see [PAYMENT_SYSTEM_README.md](PAYMENT_SYSTEM_README.md)

## 🐛 Troubleshooting

### Payment not opening?
- Check if Razorpay script is loaded in `frontend/index.html`
- Verify `VITE_RAZORPAY_KEY_ID` in frontend `.env`
- Check browser console for errors

### Payment verification failed?
- Verify `RAZORPAY_KEY_SECRET` matches in backend
- Check signature calculation logic
- Ensure order_id is correct

### Server connection issues?
- Verify MongoDB connection string
- Check if backend server is running
- Verify CORS configuration

For more troubleshooting, see [PAYMENT_SYSTEM_README.md](PAYMENT_SYSTEM_README.md)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Student
- `GET /api/student/profile` - Get student profile
- `POST /api/student/documents/upload` - Upload document
- `POST /api/student/hostel/apply` - Apply for hostel
- `POST /api/student/lms/activate` - Activate LMS

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment signature

For complete API documentation, see [PAYMENT_SYSTEM_README.md](PAYMENT_SYSTEM_README.md)

## 👥 User Roles

### Student
- Upload documents
- Pay tuition fees
- Apply for hostel
- Register for courses
- View timetable

### Staff
- Review documents
- Approve/reject applications
- View student profiles

### Admin
- Manage all users
- View analytics
- System configuration

## 🎯 Project Goals

- ✅ Streamline student onboarding
- ✅ Automate document verification
- ✅ Simplify fee payment process
- ✅ Manage hostel applications
- ✅ Integrate LMS activation
- ✅ Provide real-time updates
- ✅ Ensure secure transactions

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] SMS confirmations
- [ ] Payment receipts (PDF)
- [ ] Refund functionality
- [ ] Payment analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🤝 Contributing

This is a hackathon/demo project. For production use, please ensure:
- Proper testing
- Security audits
- Performance optimization
- Accessibility compliance
- Legal compliance

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Razorpay for payment gateway
- Google Gemini for AI integration
- Tailwind CSS for styling
- Framer Motion for animations

---

## 🎉 Ready for Demo!

Your payment system is fully integrated and ready to impress. Follow the [PAYMENT_DEMO_SCRIPT.md](PAYMENT_DEMO_SCRIPT.md) for a smooth presentation.

**Test Card:** 4111 1111 1111 1111 | **Expiry:** 12/25 | **CVV:** 123

Good luck! 🚀

---

**Built with ❤️ for seamless student onboarding experiences**
