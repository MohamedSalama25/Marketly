import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";



// Get All complaints
export const fetchcomplaints = createAsyncThunk(
  "complaints/fetchcomplaints",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("complaints").select(`*,
        user:user_id(*)
        
        `);
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new Complaint
export const createComplaint = createAsyncThunk(
  "complaints/createComplaint",
  async (ComplaintData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert(ComplaintData)
        .select("*");
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Delete a Complaint
export const deleteComplaint = createAsyncThunk(
  "complaints/deleteComplaint",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("complaints").delete().eq("id", id);
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


      // Update Complaint
export const updateComplaint = createAsyncThunk(
  "complaints/updateComplaint",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .update(updatedData)
        .eq("id", id)
        .select(`*,
           user:user_id(*)
          `);
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

     


// Slice
const complaintsSlice = createSlice({
  name: "complaints",
  initialState: {
    complaints: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchcomplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchcomplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchcomplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints.push(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

       // Update
      .addCase(updateComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateComplaint.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.complaints.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
      })
      .addCase(updateComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
    
      // Delete
      .addCase(deleteComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = state.complaints.filter(
          (Complaint) => Complaint.id !== action.payload
        );
      })
      .addCase(deleteComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default complaintsSlice;
