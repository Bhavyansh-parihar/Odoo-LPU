import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '../pages/auth/VerifyOtpPage';

// Dashboard Page
import { DashboardPage } from '../pages/dashboard/DashboardPage';

// Products Pages
import { ProductsListPage } from '../pages/products/ProductsListPage';
import { ProductCreatePage } from '../pages/products/ProductCreatePage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';

// Operations Pages
import { ReceiptsPage } from '../pages/operations/ReceiptsPage';
import { ReceiptDetailPage } from '../pages/operations/ReceiptDetailPage';
import { DeliveriesPage } from '../pages/operations/DeliveriesPage';
import { DeliveryDetailPage } from '../pages/operations/DeliveryDetailPage';
import { TransfersPage } from '../pages/operations/TransfersPage';
import { AdjustmentsPage } from '../pages/operations/AdjustmentsPage';

// Move History & Settings & Profile
import { MoveHistoryPage } from '../pages/move-history/MoveHistoryPage';
import { WarehouseSettingsPage } from '../pages/settings/WarehouseSettingsPage';
import { UsersSettingsPage } from '../pages/settings/UsersSettingsPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { ProfileEditPage } from '../pages/profile/ProfileEditPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* Main ERP Protected Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Products */}
        <Route path="/products" element={<ProductsListPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* Operations */}
        <Route path="/operations/receipts" element={<ReceiptsPage />} />
        <Route path="/operations/receipts/:id" element={<ReceiptDetailPage />} />
        <Route path="/operations/deliveries" element={<DeliveriesPage />} />
        <Route path="/operations/deliveries/:id" element={<DeliveryDetailPage />} />
        <Route path="/operations/transfers" element={<TransfersPage />} />
        <Route path="/operations/adjustments" element={<AdjustmentsPage />} />

        {/* History, Settings & Profile */}
        <Route path="/move-history" element={<MoveHistoryPage />} />
        <Route path="/settings/warehouse" element={<WarehouseSettingsPage />} />
        <Route path="/settings/users" element={<UsersSettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
