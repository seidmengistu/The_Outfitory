import { useAuth } from "../hooks/useAuth";
import { useOutfits } from "../hooks/useOutfits";
import { useWardrobe } from "../hooks/useWardrobe";
import { LogOut } from "lucide-react";
import type { BackendOutfit } from "../types";

export default function Profile() {
    const { user, logout } = useAuth();
    
    const initials = user?.username 
        ? user.username.slice(0, 2).toUpperCase()
        : user?.Email?.slice(0, 2).toUpperCase() || '??';

        const {clothes} = useWardrobe()
        const {outfits} = useOutfits()

          const backendOutfits = outfits as unknown as BackendOutfit[]
        

    return (
        <div className="min-h-screen px-4 py-8 dark:bg-slate-900">
            <div className="w-full max-w-2xl mx-auto space-y-8">
                
                {/* Profile Header Card */}
                <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-8 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white/50 dark:ring-white/10 flex-shrink-0">
                            <span className="text-3xl font-bold text-white tracking-wider">
                                {initials}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {user?.username || 'User'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-white/60">
                                {user?.Email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Activity Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Your Closet Activity
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-xl backdrop-blur-sm text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{clothes.length}</p>
                            <p className="text-sm text-gray-500 dark:text-white/60">Items in Wardrobe</p>
                        </div>
                        <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-xl backdrop-blur-sm text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{backendOutfits.length}</p>
                            <p className="text-sm text-gray-500 dark:text-white/60">Outfits Created</p>
                        </div>
                        <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-6 shadow-xl backdrop-blur-sm text-center">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">None</p>
                            <p className="text-sm text-gray-500 dark:text-white/60">Favourite Outfit</p>
                        </div>
                    </div>
                </div>

                {/* Account Settings Section */}
                <div className="rounded-2xl border bg-white/80 dark:bg-white/5 border-black/10 dark:border-white/10 p-8 shadow-xl backdrop-blur-sm space-y-6">
                    
                        <button 
                            onClick={logout}
                            className="w-full cursor-pointer flex items-center justify-between py-3 px-4 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-red-500 font-bold"
                        >
                            <span className="flex items-center gap-3">
                                <LogOut/>
                                Sign Out
                            </span>
                        </button>
                </div>
            </div>
        </div>
    );
}
