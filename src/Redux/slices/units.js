import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";


export const GetUnits = createAsyncThunk(
  "Units/getUnits",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("units").select("*");
      if (error) throw error;
      return data;
    } 
    catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const AddUnit = createAsyncThunk(
    "Units/addUnit",
    async (UnitData, { rejectWithValue }) => {
        try {
        const { data, error } = await supabase.from("units").insert(UnitData).select();
        if (error) throw error;
        return data[0]; 
        } 
        catch (error) {
        return rejectWithValue(error.message);
        }
    }
);

export const UpdateUnit = createAsyncThunk(
    "Units/updateUnit",
    async ({ id, updatedData }, { rejectWithValue }) => {
        try {
            console.log(updatedData);

            const { data, error } = await supabase.from("units").update(updatedData).eq("id", id).select();
            if (error) throw error;
            return data[0];
        } 
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const DeleteUnit = createAsyncThunk(
    "Units/deleteUnit",
    async (id, { rejectWithValue }) => {
        try {
            const { error } = await supabase.from("units").delete().eq("id", id);
            if (error) throw error;
            return id;
        } 
        catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const UnitsSlice = createSlice({
  name: "Units",
  initialState: {
    Units: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.Units = action.payload;
      })
      .addCase(GetUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(AddUnit.fulfilled, (state, action) => {
        state.Units.push(action.payload);
      })
      .addCase(UpdateUnit.fulfilled, (state, action) => {
        const index = state.Units.findIndex(Unit => Unit.id === action.payload.id);
        if (index !== -1) {
          state.Units[index] = action.payload;
        }
      })
      .addCase(DeleteUnit.fulfilled, (state, action) => {
        state.Units = state.Units.filter(Unit => Unit.id !== action.payload);
      });
  },
 
});


export default UnitsSlice;
