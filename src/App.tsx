import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { PageLoader } from '@/components/ui/PageLoader';
import { Navbar } from '@/components/ui/Navbar';
import { CartDrawer } from '@/features/cart/components/CartDrawer';

const HomePage        = lazy(() => import('@/pages/HomePage'));
const ProductsPage    = lazy(() => import('@/pages/ProductsPage'));
const CustomizerPage  = lazy(() => import('@/pages/CustomizerPage'));
const CheckoutPage    = lazy(() => import('@/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));
const OrderCancelPage  = lazy(() => import('@/pages/OrderCancelPage'));
const AccountPage     = lazy(() => import('@/pages/AccountPage'));
const NotFoundPage    = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                element={<HomePage />} />
          <Route path="/products"        element={<ProductsPage />} />
          <Route path="/customize/:id"   element={<CustomizerPage />} />
          <Route path="/checkout"        element={<CheckoutPage />} />
          <Route path="/order/success"   element={<OrderSuccessPage />} />
          <Route path="/order/cancel"    element={<OrderCancelPage />} />
          <Route path="/account"         element={<AccountPage />} />
          <Route path="/404"             element={<NotFoundPage />} />
          <Route path="*"               element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
