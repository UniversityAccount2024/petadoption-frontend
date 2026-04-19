import { supabase } from "../api/supabase";

export const profileService = {
    async getProfile(address: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('wallet_address', address.toLowerCase())
            .single()
        
            // no rows found
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async uploadAvatar(address: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${address.toLowerCase()}/${Math.random()}.${fileExt}`;

        // Upload file to STORAGE
        const { error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(filePath, file, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        // Getting public URL 
        const { data } = supabase.storage.from('avatar').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
                wallet_address: address.toLowerCase(),
                avatar_url: publicUrl
            }, { onConflict: 'wallet_address' }); 

        if (updateError) throw updateError;
        return publicUrl;
    }
};