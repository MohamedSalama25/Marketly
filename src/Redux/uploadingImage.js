import { supabase } from "../Supabase/supabaseClient";

export const uploadImagesToSupabase = async (files,store) => {
  const uploadedUrls = [];
  for (const file of files) {
    const fileName = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from(store)
      .upload(fileName, file);

    if (error) {
console.log("[UPLOAD] Public URL for", fileName, "=>", publicUrlData.publicUrl);
      
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(store)
      .getPublicUrl(fileName);
console.log("[UPLOAD] Public URL for", fileName, "=>", publicUrlData.publicUrl);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  
  return uploadedUrls;
};

// جرب كده واطبع النتيجة
export const deleteImageFromStore = async (publicUrl, bucket) => {
  try {
    // استخراج اسم الصورة من الرابط
    const url = new URL(publicUrl);
    const idx = url.pathname.indexOf(`/public/${bucket}/`);
    const filePath = url.pathname.slice(idx + `/public/${bucket}/`.length);

    console.log("[DELETE] trying to delete filePath:", filePath, "from bucket:", bucket);

    const { data, error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("[DELETE] Error from supabase:", error);
    } else {
      console.log("[DELETE] Deleted data from supabase:", data);
    }

    return { data, error };
  } catch (err) {
    console.error("[DELETE] Exception:", err);
  }
};
