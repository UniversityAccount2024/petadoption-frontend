import { HeroBackgroundPaws } from "../components/home/HeroBackgroundPaws";
import PetListingSection from "../components/home/PetListingSection";
import { PetOwnerModal } from "../components/ui/PetOwnerModal";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { profileService } from "../api/profileService";
import { petService } from "../api/petService";
import { useLocation } from "react-router-dom";

// Use a web link as a fallback instead of a local file
const DEFAULT_AVATAR = "https://placehold.co/400x400?text=No+Profile+Pic";

export default function HomePage() {
    const navigate = useNavigate();
    const [showOwnerModal, setShowOwnerModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pets, setPets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State to hold the dynamic profile data from Supabase
    const [selectedOwner, setSelectedOwner] = useState<{name: string, avatar: string} | null>(null);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                setIsLoading(true);
                // The small delay helps Supabase finish indexing before we fetch
                await new Promise(resolve => setTimeout(resolve, 150));
                const data = await petService.getAllPets();
                setPets(data);
            } catch (error) {
                console.error("Failed to fetch pets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPets();

        const handleRefresh = () => fetchPets();
        window.addEventListener("pet-listed", handleRefresh);
        return () => window.removeEventListener("pet-listed", handleRefresh);
    },  [location.pathname]); 

    // Function to fetch the real owner data from Supabase
    const handleOwnerClick = async (walletAddress: string) => {
        try {
            const profile = await profileService.getOrCreateProfile(walletAddress);
            setSelectedOwner({
                name: profile.full_name || "Guest User",
                avatar: profile.avatar_url || DEFAULT_AVATAR
            });
            setShowOwnerModal(true);
        } catch (error) {
            console.error("Error loading owner profile:", error);
            setSelectedOwner({ name: "Guest User", avatar: DEFAULT_AVATAR });
            setShowOwnerModal(true);
        }
    };

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Section */}
            <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF2E5] to-white lg:min-h-[500px] flex items-center">
                <HeroBackgroundPaws />

                <div className="max-w-[1240px] w-full mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10 flex flex-col justify-center">
                    <div className="max-w-[540px]">
                        <h1 className="text-[36px] lg:text-[44px] font-black leading-[1.15] tracking-[0.04em] text-[#0D162B] mb-5">
                            WELCOME PET LOVER!
                        </h1>

                        <p className="text-[17px] leading-[1.6] text-gray-700 font-medium mb-10 max-w-[480px]">
                            Research has shown that those who keep pets for emotional support or companionship tend to live a longer life.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate("/list-for-adoption")}
                                className="bg-[#E84D2A] text-white font-semibold py-3.5 px-8 rounded-lg hover:bg-[#d4431f]"
                            >
                                List For Adoption
                            </button>

                            <button
                                onClick={() => navigate("/listings")}
                                className="bg-[#0D1B2A] text-white font-semibold py-3.5 px-8 rounded-lg hover:bg-gray-900"
                            >
                                I Want To Adopt
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Auto Refresh Listing Section */}
            <PetListingSection
                pets={pets} // pass fetched pets
                isLoading={isLoading} // pass loading stage 
                onOwnerClick={(address: string) => handleOwnerClick(address)}
            />

            <PetOwnerModal
                isOpen={showOwnerModal}
                onClose={() => setShowOwnerModal(false)}
                // Uses the state we fetched from Supabase instead of mockOwnerImg
                ownerImage={selectedOwner?.avatar || DEFAULT_AVATAR}
                ownerName={selectedOwner?.name || "Loading..."}
            />
        </div>
    );
}