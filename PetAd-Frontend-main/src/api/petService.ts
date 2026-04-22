import { supabase } from './supabase';
import PetAdoptionABI from '../contract/PetAdoptionABI.json';
import { ethers } from 'ethers';

const CONTRACT_ABI = PetAdoptionABI;
const CONTRACT_ADDRESS = import.meta.env.VITE_PET_ADOPTION_ADDRESS;


export const petService = {
    // UPLOAD IMAGE: Handles the "Heavy Metadata" in distributed storage
    async uploadPetImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('pets')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('pets').getPublicUrl(filePath);
        return data.publicUrl;
    },

    // CREATE: Saves pet data + Image URL + Blockchain Provenance 
    async createPet(petData: any, ownerAddress: string) {
        const { data, error } = await supabase
            .from('pets')
            .insert({
                name: petData?.name,
                breed: petData?.breed,
                category: petData?.petType?.toLowerCase() || 'other',
                age: petData?.age,
                location: petData?.location,
                description: petData?.description,
                // SAFETY FIX: Checks images array first, then falls back to string URL
                image_url: petData?.images?.[0] || petData?.image_url || null, 
                lister_address: ownerAddress.toLowerCase(),
                gender: petData?.gender,
                vaccination_status: petData?.vaccination,
                status: 'available',
                // HYBRID SYSTEM: Simulated Blockchain Identity
                token_id: petData?.token_id || Math.floor(Math.random() * 1000000),
                contract_address: petData?.contract_address || CONTRACT_ADDRESS
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
        async registerPetOnChain(petData: any) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Use the imported ABI here
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const tx = await contract.registerPet(
            petData.name,
            petData.breed,
            petData.location,
            petData.gender === 'male' ? 0 : 1,
            0, 
            BigInt(petData.age),
            petData.image_url 
        );

        const receipt = await tx.wait();
        return receipt.hash;
    },


    // READ ONE: Joins pet with owner profile 
    async getPetId(id: string) {
        const { data, error } = await supabase
            .from('pets')
            .select(`
                *, 
                owner:profiles!lister_address(full_name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // READ ALL: Fetches available pets for the Home Page 
    async getAllPets() {
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },


    // UPDATE: Modifies existing record 
    async updatePet(id: string, updates: any) {
        const { data, error } = await supabase
            .from('pets')
            .update({
                name: updates?.name,
                breed: updates?.breed,
                category: (updates?.category || updates?.petType)?.toLowerCase(),
                age: updates?.age,
                location: updates?.location,
                description: updates?.description,
                image_url: updates?.image_url,
                gender: updates?.gender,
                vaccination_status: updates?.vaccination_status
            })
            .eq('id', id)
            .select(); 

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    },

    // DELETE: Removes pet from database 
    async deletePet(id: string) {
        const { error } = await supabase
            .from('pets')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },
};
