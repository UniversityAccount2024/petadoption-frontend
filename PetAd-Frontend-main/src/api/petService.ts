import { supabase } from './supabase';

export const petService = {
    async uploadPetImage(file: File) {
        // Create a unique filename to prevent overwriting
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        // Upload to the 'pets' bucket we made public with SQL
        const { error: uploadError } = await supabase.storage
            .from('pets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Return the permanent public URL
        const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
        return data.publicUrl;
    },

    // Saves the pet data + the image URL
    async createPet(petData: any, ownerAddress: string) {
        const { data, error } = await supabase
            .from('pets')
            .insert({
                name: petData.name,
                breed: petData.breed,
                category: petData.petType?.toLowerCase() || 'other',
                age: petData.age,
                location: petData.location,
                description: petData.description,
                image_url: petData.images[0], 
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

    // Joins the pet with the owner's profile
    async getPetId(id: string) {
        const { data, error } = await supabase
            .from('pets')
            .select(`
                *, 
                owner:profiles!lister_address(full_name, avatar_url)
            `) // !lister_address tells Supabase which column to use for the join
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // READ ALL: Fetches all available pets
    async getAllPets() {
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // UPDATE an existing pet
    async updatePet(id: string, updates: any) {
        const { data, error } = await supabase
            .from('pets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // DELETE pet from database
    async deletePet(id: string) {
        const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
};