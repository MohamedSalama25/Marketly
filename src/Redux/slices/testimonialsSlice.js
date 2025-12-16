import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";

export const fetchTestimonials = createAsyncThunk(
  "testimonials/fetchTestimonials",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*, users(name)");

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTestimonial = createAsyncThunk(
  "testimonials/deleteTestimonial",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTestimonial = createAsyncThunk(
  "testimonials/updateTestimonial",
  async ({ id, isPublished }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .update({ isPublished })
        .eq("id", id)
        .select("*, users(name)");
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const TestimonialsSlice = createSlice({
  name: "testimonials",
  initialState: {
    testimonials: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = action.payload;
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        state.testimonials = state.testimonials.filter(
          (item) => item.id !== action.payload
        );
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateTestimonial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.testimonials.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.testimonials[index] = action.payload;
        }
      })
      .addCase(updateTestimonial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default TestimonialsSlice.reducer;
