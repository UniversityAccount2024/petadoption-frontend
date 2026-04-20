import { useState, useEffect, useMemo } from "react";
import { useAccount } from 'wagmi'; 
import { PetCard, type Pet } from "../components/ui/PetCard";
import { FormSelect } from "../components/ui/formSelect";
import { favoritesService } from "../api/favouritesService";

const CATEGORY_OPTIONS = [
    { value: "all", label: "Category: All" },
    { value: "dog", label: "Dog" },
    { value: "cat", label: "Cat" },
    { value: "bird", label: "Bird" },
];

export default function FavouritePage() {
    const { address, isConnected } = useAccount();
    
    // State
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationFilter, setLocationFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Fetching favourites from Supabase
    useEffect(() => {
        async function loadFavorites() {
            if (!address) {
                setPets([]);
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await favoritesService.getFavoritePets(address);
                setPets(data);
            } catch (error) {
                console.error("Failed to load favorites:", error);
            } finally {
                setLoading(false);
            }
        }
        if (isConnected) {
            loadFavorites();
        } else {
            setLoading(false);
        }
    }, [address, isConnected]);

    // 2. Filter Logic (This was missing!)
    const filteredPets = useMemo(() => {
        return pets.filter((pet) => {
            const matchesCategory =
                categoryFilter === "all" || pet.category?.toLowerCase() === categoryFilter.toLowerCase();

            const matchesLocation =
                locationFilter === "" ||
                pet.location?.toLowerCase().includes(locationFilter.toLowerCase());

            return matchesCategory && matchesLocation;
        });
    }, [pets, locationFilter, categoryFilter]);

    const handleToggleFavourite = async (id: string) => {
        if (!address) return;
        try {
            const isNowFav = await favoritesService.toggleFavorite(address, id);
            if (!isNowFav) {
                setPets((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (error) {
            alert("Error updating favorite");
        }
    };

    const handleToggleInterested = (id: string) => {
        setPets((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, isInterested: !p.isInterested } : p
            )
        );
    };

    const handleResetFilters = () => {
        setLocationFilter("");
        setCategoryFilter("all");
    };

    // UI States
    if (loading) return <div className="text-center py-20 font-medium text-gray-500">Loading your favorites...</div>;
    
    if (!isConnected) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-500">Please connect your wallet to view your favorites.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9FAFB] pb-24">
            <div className="bg-white border-b border-gray-100 h-20 mb-8" />

            <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-[22px] font-bold text-[#0D162B]">
                        Favourites ({filteredPets.length})
                    </h1>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-[220px]">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Filter by Location"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[14px] outline-none focus:border-[#0D162B] transition-colors"
                            />
                        </div>

                        <div className="w-[160px] relative">
                            <FormSelect
                                id="category-filter"
                                label=""
                                options={CATEGORY_OPTIONS}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="!py-2.5"
                            />
                        </div>

                        <button
                            onClick={handleResetFilters}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-medium text-[14px] hover:bg-gray-200 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {filteredPets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPets.map((pet) => (
                            <PetCard
                                key={pet.id}
                                pet={pet}
                                onToggleFavourite={handleToggleFavourite}
                                onToggleInterested={handleToggleInterested}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No favourites found</h3>
                        <p className="text-gray-500 max-w-[300px]">
                            {pets.length > 0
                                ? "No pets match your current filters."
                                : "You haven't added any pets to your favourites yet!"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}