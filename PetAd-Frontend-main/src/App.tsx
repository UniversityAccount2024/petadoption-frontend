import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";

// AUTH PAGES
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/resetPasswordPage";
import ForgetPasswordPage from "./pages/forgetPasswordPage";

// MAIN PAGES
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import FavouritePage from "./pages/FavouritePage";
import InterestPage from "./pages/interestPage";
import ListingsPage from "./pages/ListingsPage";
import NotificationPage from "./pages/notificationPage";

// THE TWO IMPORTANT PAGES
import PetlistingdetailsPage from "./pages/PetlistingdetailsPage";
import EditAdoptionListing from "./pages/EditAdoptionListing";    

// UTILITY PAGES
import ModalPreview from "./pages/ModalPreview"; 
import { AdoptionCompletionDemo } from "./pages/AdoptionCompletionDemo";

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgetPasswordPage />} />

      {/* Main App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favourites" element={<FavouritePage />} />
        <Route path="/interests" element={<InterestPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/listings/:id" element={<PetlistingdetailsPage />} />
        <Route path="/list-for-adoption" element={<EditAdoptionListing />} />
        <Route path="/edit-listing/:id?" element={<EditAdoptionListing />} />

        {/* Preview Routes */}
        <Route path="/preview-modal" element={<ModalPreview />} />
        <Route path="/adoption-completion-demo" element={<AdoptionCompletionDemo />} />
      </Route>
    </Routes>
  );
}
export default App;
