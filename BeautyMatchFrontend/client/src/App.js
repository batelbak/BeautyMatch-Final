import React from 'react';
import RequestAccessPage from './pages/RequestAccessPage';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AdminDashboard from './pages/AdminDashboard';
import WarehouseDashboard from './pages/WarehouseDashboard';
import CustomerCatalog from './pages/CustomerCatalog';
import CheckoutPage from './pages/CheckoutPage';
import QuizPage from './pages/QuizPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import Footer from './components/Footer';
import SettingsPage from './pages/SettingsPage';
const MainLayout = () => (
    <div>
        <Navbar />
        <CartDrawer />
        <div style={{ padding: '20px' }}>
            <Outlet />
        </div>
        <Footer />
    </div>
);

const RoleBasedRouter = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return <Navigate to="/login" />;
    switch (user.userRole) {
        case 'admin': return <AdminDashboard />;
        case 'logistics': return <WarehouseDashboard />;
        default: return <CustomerCatalog />;
    }
};

function App() {
    return (
        <CartProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/request-access" element={<RequestAccessPage />} />

                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<RoleBasedRouter />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-success" element={<OrderSuccessPage />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                </Routes>
            </Router>
        </CartProvider>
    );
}

export default App;