import { supabase } from "../Supabase/supabaseClient";

const TEMP_ID = "28fe037d-a829-4ecf-8f9d-2c1e4f492bba";

export const getCurrentUserId = async () => {
  if (supabase.auth.getUser) {
    const { data } = await supabase.auth.getUser(); // v2
    return data?.user?.id || TEMP_ID;
  }
  return TEMP_ID; // أثناء التطوير
};
