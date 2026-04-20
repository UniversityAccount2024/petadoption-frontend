import { supabase } from '../api/supabase';

export const profileService = {
  async getOrCreateProfile(address: string) {
    const wallet = address.toLowerCase();

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, wallet_address')
      .eq('wallet_address', wallet)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: created, error: createError } = await supabase
      .from('profiles')
      .insert({ wallet_address: wallet, full_name: 'Guest User' })
      .select('full_name, avatar_url, wallet_address')
      .single();

    if (createError) throw createError;
    return created;
  },

  async uploadAvatar(address: string, file: File) {
    const wallet = address.toLowerCase();
    const ext = file.name.split('.').pop();
    const path = `${wallet}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatar')
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatar').getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ wallet_address: wallet, avatar_url: data.publicUrl }, { onConflict: 'wallet_address' });

    if (updateError) throw updateError;
    return data.publicUrl;
    
  },

    async updateName(address: string, full_name: string) {
        const wallet = address.toLowerCase();

        const { error } = await supabase
        .from("profiles")
        .upsert(
            {
            wallet_address: wallet,
            full_name,
            },
            { onConflict: "wallet_address" }
        );

        if (error) throw error;
    }
};