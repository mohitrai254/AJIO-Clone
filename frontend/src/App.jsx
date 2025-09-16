// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OtpPage from "./pages/OtpPage";
import RegisterPage from "./pages/RegisterPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import DeliveryPage from "./pages/DeliveryPage";
import PaymentPage from "./pages/PaymentPage";
import OrdersPage from "./pages/OrdersPage"; // new

// Payment result pages
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import ProductNotFound from "./pages/ProductNotFound";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Payment result routes (PayU redirects here directly) */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailure />} />

        {/* Protected / Main Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<CategoryPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* delivery and payment are protected */}
          <Route
            path="/delivery"
            element={
              <ProtectedRoute>
                <DeliveryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />

          {/* orders protected */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route path="/product-not-found" element={<ProductNotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
