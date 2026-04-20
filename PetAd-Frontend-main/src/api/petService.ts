import { supabase } from './supabase';

export const petService = {
    async createPet(petData: any, ownerAddress: string) {
        const { data, error } = await supabase
            .from('pets')
            .insert({
                id: petData.id,
                name: petData.name,
                breed: petData.breed,
                category: petData.petType?.toLowerCase() || 'other',
                age: petData.age,
                location: petData.location,
                description: petData.description,
                image_url: petData.images[0], // Primary image
                lister_address: ownerAddress.toLowerCase(),
                gender: petData.gender,
                vaccination_status: petData.vaccination,
                status: 'available' 
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Get petID

    async getPetId(id: string) {
        const { data, error } = await supabase
            .from('pets')
            .select(`
            *, 
            profiles:lister_address (full_name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getAllPets() {
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .eq('status', 'available')
            .order('created_at', {ascending: false});

        if (error) throw error;
        return data;
    },
}