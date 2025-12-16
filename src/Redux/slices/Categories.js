import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";


export const GetCategories = createAsyncThunk(
  "categories/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data;
    } 
    catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const AddCategory = createAsyncThunk(
    "categories/addCategory",
    async (categoryData, { rejectWithValue }) => {
        try {
        const { data, error } = await supabase.from("categories").insert(categoryData).select();
        if (error) throw error;
        return data[0]; 
        } 
        catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const UpdateCategory = createAsyncThunk(
    "categories/updateCategory",
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            console.log(updatedData);

            const { data, error } = await supabase.from("categories").update(updatedData).eq("id", id).select();
            if (error) throw error;
            return data[0];
        } 
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const DeleteCategory = createAsyncThunk(
    "categories/deleteCategory",
    async (id, { rejectWithValue }) => {
        try {
            const { error } = await supabase.from("categories").delete().eq("id", id);
            if (error) throw error;
            return id;
        } 
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(GetCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(AddCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(UpdateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(DeleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(category => category.id !== action.payload);
      });
  },
 
});


export default categoriesSlice;
