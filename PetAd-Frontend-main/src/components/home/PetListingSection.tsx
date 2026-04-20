// components/home/PetListingSection.tsx
import { useEffect, useState } from "react";
import { petService } from "../../api/petService";
import { PetCard } from "../ui/PetCard"; 

export function PetListingSection({ onOwnerClick }: { onOwnerClick: () => void }) {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPets() {
            try {
                setLoading(true);
                const data = await petService.getAllPets();
                setPets(data);
            } catch (error) {
                console.error("Error fetching marketplace pets:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPets();
    }, []);

    if (loading) return <div className="py-20 text-center">Loading available pets...</div>;

    return (
        <section className="max-w-[1240px] mx-auto px-6 py-16">
            <h2 className="text-2xl font-bold mb-8">Available for Adoption</h2>
            
            {pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pets.map((pet) => (
                        <PetCard 
                            key={pet.id} 
                            pet={{
                            ...pet,
                            imageUrl: pet.image_url,
                            isFavourite: false, 
                            isInterested: false 
                            }} 
                            onToggleFavourite={(id) => console.log("Fav", id)}
                            onToggleInterested={(id) => console.log("Interested", id)}
                        />
                        ))}
                </div>
            ) : (
                <p className="text-gray-500">No pets available for adoption right now. Check back later!</p>
            )}
        </section>
    );
}