import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from 'wagmi'; 
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { profileService } from "../api/profileService"

const dogImg = "https://placedog.net/600/400?id=1";
import { AdoptionDetailsModal } from "../components/ui/AdoptionDetailsModal";
import { ListingDetailsModal } from "../components/ui/ListingDetailsModal";

// --- 1. Interfaces & Mock Data ---
interface AdoptionRecordItem {
    id: string;
    petImage: string;
    petName: string;
    petDescription: string;
    dateReceived: string;
}

interface ListingRecordItem {
    id: string;
    petImage: string;
    petName: string;
    petDescription: string;
    dateTransferred: string;
}

const MOCK_ADOPTION_RECORDS: AdoptionRecordItem[] = [
    { id: "adopt-1", petImage: dogImg, petName: "Dog Pet", petDescription: "Dog, German Shepard, 4yrs old", dateReceived: "10 Jan 2025" },
    { id: "adopt-2", petImage: dogImg, petName: "Dog Pet", petDescription: "Dog, German Shepard, 4yrs old", dateReceived: "10 Jan 2025" },
];

const MOCK_LISTING_RECORDS: ListingRecordItem[] = [
    { id: "list-1", petImage: dogImg, petName: "Dog Pet", petDescription: "Dog, German Shepard, 4yrs old", dateTransferred: "10 Jan 2025" },
    { id: "list-2", petImage: dogImg, petName: "Dog Pet", petDescription: "Dog, German Shepard, 4yrs old", dateTransferred: "10 Jan 2025" },
];

// Helper functions for details
function getAdoptionDetails(id: string) {
    const r = MOCK_ADOPTION_RECORDS.find((x) => x.id === id);
    if (!r) return null;
    return {
        pet: { imageUrl: r.petImage, name: r.petName, petType: "Dog", breed: "German Shepard", age: "4 Years Old", gender: "Female", vaccinated: "Yes" },
        receipt: { dateReceived: r.dateReceived, receiptAddress: "Fuse Road, Lagos Nigeria", petCondition: "Good" },
        lister: { imageUrl: "", fullName: "Lister Name", location: "Lagos, Nigeria", profileId: "lister-1" },
    };
}

function getListingDetails(id: string) {
    const r = MOCK_LISTING_RECORDS.find((x) => x.id === id);
    if (!r) return null;
    return {
        pet: { imageUrl: r.petImage, name: r.petName, petType: "Dog", breed: "German Shepard", age: "4 Years Old", gender: "Female", vaccinated: "Yes" },
        transfer: { dateTransferred: r.dateTransferred, transferAddress: "Fuse Road, Lagos Nigeria" },
        adopter: { imageUrl: "", fullName: "Adopter Name", location: "Lagos, Nigeria", profileId: "adopter-1" },
    };
}

// --- 2. The Main Component ---
export default function ProfilePage() {
    const navigate = useNavigate();
    const { isConnected, address, status } = useAccount();


    // Profile and Loading State
    const [profile, setProfile] = useState<{full_name: string, avatar_url: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState("");

    // Tab & Modal State
    const [activeTab, setActiveTab] = useState<"adoption" | "listing">("adoption");
    const [adoptionDetailsId, setAdoptionDetailsId] = useState<string | null>(null);
    const [listingDetailsId, setListingDetailsId] = useState<string | null>(null);

    // Fetch profile on mount or address change

    useEffect(() => {
    if (profile?.full_name) {
        setNameInput(profile.full_name);
    }
}, [profile]);

    useEffect(() => {
    async function loadProfile() {
        if (!isConnected || !address) {
        setProfile(null);
        setLoading(false);
        return;
        }

        try {
        setLoading(true);
        localStorage.setItem("walletAddress", address.toLowerCase());
        const data = await profileService.getOrCreateProfile(address);
        setProfile(data);
        } catch (err) {
        console.error('Error loading profile:', err);
        } finally {
        setLoading(false);
        }
    }

    loadProfile();
    }, [address, isConnected]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !address) return;

    try {
        setLoading(true);
        const avatar_url = await profileService.uploadAvatar(address, file);
        setProfile((prev) => prev ? { ...prev, avatar_url } : null);
        window.dispatchEvent(new Event("profile-updated"));
    } catch (error: any) {
        alert(error.message || 'Failed to upload image');
    } finally {
        setLoading(false);
    }

};

    const handleListerClick = () => {
        setAdoptionDetailsId(null);
        navigate("/profile");
    };

    const handleAdopterClick = () => {
        setListingDetailsId(null);
        navigate("/profile");
    };


    const handleSaveName = async () => {
        if (!address || !nameInput.trim()) return;

        try {
            setLoading(true);
            await profileService.updateName(address, nameInput.trim());

            setProfile((prev) =>
                prev
                    ? { ...prev, full_name: nameInput.trim() }
                    : { full_name: nameInput.trim(), avatar_url: "" }
            );

            window.dispatchEvent(new Event("storage"));

            setIsEditingName(false);
        } catch (error: any) {
            alert(error.message || "Failed to update name");
        } finally {
            setLoading(false);
        }
    };

    const adoptionDetails = adoptionDetailsId ? getAdoptionDetails(adoptionDetailsId) : null;
    const listingDetails = listingDetailsId ? getListingDetails(listingDetailsId) : null;

    return (
        <div className="min-h-screen flex flex-col pb-12 bg-gray-50">
            {/* Top Bar */}
            <div className="bg-white border-b border-gray-100 h-20 mb-8 shrink-0 flex items-center justify-between px-8">
                <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
                <ConnectButton /> 
            </div>

            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6 lg:gap-8 flex-1">
                
                {/* Profile Card Sidebar */}
                <div className="w-full md:w-[340px] lg:w-[380px] border border-gray-200 rounded-2xl p-6 bg-white shadow-sm h-fit">
                    
                    {/* Image Section with Upload Hover */}
                    <div className="relative mb-4 flex justify-center group">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-sm bg-gray-200 relative">
                            {loading ? (
                                <div className="w-full h-full animate-pulse bg-gray-300" />
                            ) : (
                                <>
                                    <img 
                                        src={profile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=PetAd"} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <span className="text-white text-xs font-bold">Change Photo</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageUpload}
                                            disabled={loading}
                                        />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-[#E8F5E9] text-[#22C55E] rounded-md mb-6">
                        <span className="text-[13px] font-semibold tracking-wide">Account Verified</span>
                        <svg className="w-[14px] h-[14px]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* User Details */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[12px] text-gray-400 uppercase font-bold">Full Name</p>
                            {!isEditingName && (
                                <button 
                                    onClick={() => setIsEditingName(true)}
                                    className="text-[11px] text-blue-500 hover:underline font-bold"
                                >
                                    Edit
                                </button>
                            )}
                        </div>

                        {isEditingName ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter full name"
                                    autoFocus
                                />
                            <div className="flex gap-2">
                <button
                    onClick={handleSaveName}
                    disabled={loading}
                    className="flex-1 bg-green-500 text-white text-[12px] py-1.5 rounded-md font-bold hover:bg-green-600"
                >
                    {loading ? "Saving..." : "Save"}
                </button>
                <button
                    onClick={() => {
                        setIsEditingName(false);
                        setNameInput(profile?.full_name || "Guest User");
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 text-[12px] py-1.5 rounded-md font-bold hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>
        </div>
    ) : (
        <p className="text-[15px] font-semibold text-[#0D162B]">
            {loading ? "Loading..." : (profile?.full_name || "Guest User")}
        </p>
    )}
</div>

                    {/* Blockchain Action */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {isConnected ? (
                            <button 
                                onClick={() => navigate('/list-for-adoption')}
                                className="w-full bg-[#E84D2A] text-white py-3.5 rounded-xl font-bold hover:bg-[#d4431f] transition-all"
                            >
                                + Mint Pet Passport
                            </button>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <p className="text-[11px] text-gray-500 text-center">Connect your wallet to enable blockchain features</p>
                                <ConnectButton />
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 border border-gray-200 rounded-2xl bg-white overflow-hidden flex flex-col shadow-sm">
                    <div className="flex bg-white border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab("adoption")}
                            className={`px-8 py-5 text-[15px] font-bold transition-all ${activeTab === "adoption" ? "bg-gray-50 border-r border-gray-100" : "text-gray-400"}`}
                        >
                            Adoption Record
                        </button>
                        <button
                            onClick={() => setActiveTab("listing")}
                            className={`px-8 py-5 text-[15px] font-bold transition-all ${activeTab === "listing" ? "bg-gray-50 border-l border-gray-100" : "text-gray-400"}`}
                        >
                            Listing Record
                        </button>
                    </div>
                    
                    <div className="p-6">
                        {activeTab === "adoption" ? (
                            <p>Adoption list goes here...</p>
                        ) : (
                            <p>Listing list goes here...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AdoptionDetailsModal 
                isOpen={!!adoptionDetailsId} 
                onClose={() => setAdoptionDetailsId(null)} 
                data={adoptionDetails} 
                onListerClick={handleListerClick} 
            />
            <ListingDetailsModal 
                isOpen={!!listingDetailsId} 
                onClose={() => setListingDetailsId(null)} 
                data={listingDetails} 
                onAdopterClick={handleAdopterClick} 
            />
        </div>
    );
}