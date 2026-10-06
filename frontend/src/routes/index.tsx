import { Routes, Route } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OutfitCreator from '../pages/OutfitCreator';
import Wardrobe from '../pages/Wardrobe';
import Wishlist from '../pages/Wishlist';
import Profile from '../pages/Profile';
// import { AboutAsPage } from '../pages/AboutAsPage';
import UploadClothing from '../pages/UploadClothing';
import AIChatbot from '../pages/AIChatbot';
import CalendarPage from '../pages/CalendarPage';
import Collection from '../pages/Collection';
import CollectionDetailsPage from '../pages/CollectionDetailsPage';
import SavedOutfits from '../pages/SavedOutfits';
import ProtectedRoute from '../components/features/auth/ProtectedRoute';
import TravelLists from '../pages/TravelLists';
import TravelDetail from '../pages/TravelDetail';

export default function AppRoutes() {
    return (
        <div className="">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                
                {/* Auth routes (redirect if already logged in) */}
                <Route 
                    path="/login" 
                    element={
                        <ProtectedRoute requireAuth={false}>
                            <LoginPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/register" 
                    element={
                        <ProtectedRoute requireAuth={false}>
                            <RegisterPage />
                        </ProtectedRoute>
                    } 
                />

                {/* Protected routes */}
                <Route 
                    path="/add-clothing" 
                    element={
                        <ProtectedRoute>
                            <UploadClothing />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/create-outfit" 
                    element={
                        <ProtectedRoute>
                            <OutfitCreator />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/saved-outfit" 
                    element={
                        <ProtectedRoute>
                            <SavedOutfits />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/wardrobe" 
                    element={
                        <ProtectedRoute>
                            <Wardrobe />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/calendar" 
                    element={
                        <ProtectedRoute>
                            <CalendarPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/collection" 
                    element={
                        <ProtectedRoute>
                            <Collection />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/collection/:id" 
                    element={
                        <ProtectedRoute>
                            <CollectionDetailsPage />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/travels" 
                    element={
                        <ProtectedRoute>
                            <TravelLists />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/travels/:id" 
                    element={
                        <ProtectedRoute>
                            <TravelDetail />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/ai-recommendations" 
                    element={
                        <ProtectedRoute>
                            <AIChatbot />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/wishlist" 
                    element={
                        <ProtectedRoute>
                            <Wishlist />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                
                {/* 404 route */}
                <Route path='*' element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}
