import { supabase } from './supabase';
import type { Pet } from '../components/ui/PetCard'; 

export const favoritesService = {
    // Explicitly tell TypeScript this returns a Promise of a Pet array
    async getFavoritePets(address: string): Promise<Pet[]> {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                pet_id,
                pets (*) 
            `) 
            .eq('user_address', address.toLowerCase());

        if (error) throw error;
        if (!data) return [];

        // We map the database results to match your Frontend 'Pet' Interface
        return data.map((item: any) => ({
            id: item.pets.id,
            name: item.pets.name,
            breed: item.pets.breed,
            category: item.pets.category,
            age: item.pets.age,
            location: item.pets.location,
            // Map image_url (DB) to imageUrl (UI)
            imageUrl: item.pets.image_url, 
            isFavourite: true,
            isInterested: false 
        }));
    },

    async toggleFavorite(address: string, petId: string): Promise<boolean> {
        const wallet = address.toLowerCase();

        const { data: existing } = await supabase
            .from('favorites')
            .select()
            .eq('user_address', wallet)
            .eq('pet_id', petId)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_address', wallet)
                .eq('pet_id', petId);
            if (error) throw error;
            return false; 
        } else {
            const { error } = await supabase
                .from('favorites')
                .insert({ user_address: wallet, pet_id: petId });
            if (error) throw error;
            return true; 
        }
    }
};