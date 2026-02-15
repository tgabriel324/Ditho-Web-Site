
import { createClient } from "@supabase/supabase-js";

const HARDCODED_URL = "https://uphufnzppqzhkynpnmmj.supabase.co";
const HARDCODED_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaHVmbnpwcHF6aGt5bnBubW1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDA4MzksImV4cCI6MjA3OTMxNjgzOX0.ifE0jQorlaA_PBCF4wZbXIzDk73WNPBgrQBj44HUUX0";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || HARDCODED_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || HARDCODED_KEY;

export let supabase: any = null;
export let isSupabaseConfigured = false;

if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
}

export const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) return null;

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `public/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, file);

        if (error) {
            console.error('Erro no upload Supabase:', error);
            throw error;
        }

        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Falha ao fazer upload:', error);
        alert('Erro ao fazer upload da imagem. Verifique se o bucket "uploads" está criado e público.');
        return null;
    }
};
