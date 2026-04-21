import { useNavigate } from "react-router-dom";
import { PetCard } from "../ui/PetCard";

interface Pet {
    id: string;
    name: string;
    breed: string;
    age: string;
    gender: string;
    location: string;
    category?: string;
    image_url: string;
    lister_address: string; 
    created_at?: string;
    [key: string]: any;
}

// Updated Props to accept data from HomePage
interface Props {
    pets: Pet[];
    isLoading: boolean;
    onOwnerClick: (address: string) => void;
}

export default function PetListingSection({ pets, isLoading, onOwnerClick }: Props) {
    const navigate = useNavigate();

    // Show skeleton/loading state using the prop from HomePage
    if (isLoading) {
        return (
            <section className="max-w-[1240px] mx-auto px-6 py-16">
                <h2 className="text-2xl font-bold mb-8 text-[#0D162B]">Available for Adoption</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="rounded-2xl border border-gray-100 p-4 shadow-sm animate-pulse">
                            <div className="h-52 bg-gray-200 rounded-xl mb-4" />
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="max-w-[1240px] mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#0D162B]">Available for Adoption</h2>
                <button
                    onClick={() => navigate(`/listings/${pet.id}`)}
                    className="text-sm font-medium text-[#E84D2A] hover:underline"
                >
                    View All
                </button>
            </div>

            {pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pets.map((pet) => (
                        <PetCard
                            key={pet.id} 
                            pet={{
                                ...pet,
                                imageUrl: pet.image_url,
                                lister_address: pet.lister_address,
                                category: pet.category || "General",
                                isFavourite: false,
                                isInterested: false,
                            }}
                            onClick={() => navigate(`/listings/${pet.id}`)}
                            onOwnerClick={() => onOwnerClick(pet.lister_address)}
                            onToggleFavourite={(id) => console.log("Favourite:", id)}
                            onToggleInterested={(id) => console.log("Interested:", id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed rounded-2xl bg-gray-50">
                    <p className="text-lg font-medium text-gray-700 mb-2">No pets listed yet 🐾</p>
                    <p className="text-sm text-gray-500 mb-6">Be the first to list a pet for adoption.</p>
                    <button
                        onClick={() => navigate("/list-for-adoption")}
                        className="bg-[#E84D2A] text-white px-6 py-3 rounded-xl font-medium"
                    >
                        List a Pet
                    </button>
                </div>
            )}
        </section>
    );
}