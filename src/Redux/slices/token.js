import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";
export let UserRole;

export const GetToken = createAsyncThunk(
  "Token/GetToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('userID');
      // localStorage.removeItem('')
      if (!token) throw new Error("لا يوجد مستخدم مسجل دخول");
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", token)
        .single();
      if (error) throw error;   
     UserRole= data?.role || null
      return {
        token: token,
        userData: data || null,
        UserRole: data?.role || null 
      };
    } 
    catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const TokenSlice = createSlice({
  name: "Token",
  initialState: {
    token: null,
    UserRole: null,
    userData: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAuthData: (state) => {
      state.token = null;
      state.UserRole = null;
      state.userData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.UserRole = action.payload.UserRole;
        state.userData = action.payload.userData;
      })
      .addCase(GetToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthData } = TokenSlice.actions;
export default TokenSlice;