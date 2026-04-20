import { Link, useLocation } from "react-router-dom";
import { House, Eye, List, Heart, Bell, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react"; // Added
import { profileService } from "../../api/profileService"; 

const logo = "https://placehold.co/100x100/0D1B2A/FFFFFF?text=PA";
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=PetAd";

const navLinks = [
  { label: "Home", path: "/home", icon: House },
  { label: "Interests", path: "/interests", icon: Eye },
  { label: "Listings", path: "/listings", icon: List },
];

export function Navbar() {
  const location = useLocation();
  
  // 1. Add state for the user profile
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string }>({
    name: "Guest User",
    avatar: DEFAULT_AVATAR,
  });

  // Fetch profile on mount
  useEffect(() => {
    async function loadNavbarProfile() {
      const savedAddress = localStorage.getItem("walletAddress"); 
      
      // DEBUG: See if the address actually exists
      console.log("Navbar checking address:", savedAddress);

      if (!savedAddress) {
        console.warn("No wallet address found in localStorage!");
        return;
      }

      try {
        const profile = await profileService.getOrCreateProfile(savedAddress);
        console.log("Profile fetched successfully:", profile);
        
        setUserProfile({
          name: profile.full_name || "Guest User",
          avatar: profile.avatar_url || DEFAULT_AVATAR,
        });
      } catch (error) {
        console.error("Supabase fetch error in Navbar:", error);
      }
    }

    loadNavbarProfile();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      {/* ... Logo Section (No changes) ... */}
      <Link to="/home" className="flex items-center gap-2">
        <img src={logo} alt="Logo" className="w-8 h-8" />
        <div>
          <p className="font-black text-[18px] leading-none tracking-widest uppercase">PETAD</p>
          <p className="text-[9px] tracking-[0.5em] uppercase text-black/60">Pet Lovers</p>
        </div>
      </Link>

      {/* ... Main Nav Links (No changes) ... */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 text-[15px] font-medium transition-colors ${
                isActive ? "text-[#001323]" : "text-gray-500 hover:text-[#001323]"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {/* ... Favourites & Notifications (No changes) ... */}

        {/* 3. Updated Profile Link - NOW DYNAMIC */}
        <Link 
          to="/profile" 
          className="flex items-center gap-3 ml-2 cursor-pointer group hover:opacity-80 transition-all"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#E84D2A]/30 bg-gray-50">
            {/* Swapped hardcoded URL for userProfile.avatar */}
            <img 
               src={userProfile.avatar} 
               alt="Profile" 
               className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Good Morning!</p>
            {/* Swapped "Scarlet Johnson" for userProfile.name */}
            <p className="text-[14px] text-[#001323] font-bold truncate max-w-[100px]">
                {userProfile.name}
            </p>
          </div>
          <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
        </Link>
      </div>
    </nav>
  );
}