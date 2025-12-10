import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set in environment');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload room images (multiple images support)
export const uploadRoomImages = async (files, roomNumber) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { data, error } = await supabase.storage
        .from('room-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('room-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Helper function to delete room image
export const deleteRoomImage = async (imageUrl) => {
  try {
    // Extract filename from URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from('room-images')
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export default supabase;