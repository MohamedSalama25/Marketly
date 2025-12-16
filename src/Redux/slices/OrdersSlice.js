import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserRole } from "./token";
import { supabase } from "../../Supabase/SupabaseClient";

// ✅ Fetch Orders - Admin gets all, Trader gets own
export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      const userId = sessionStorage.getItem("userID");
   

      let query = supabase.from("orders").select(`
        *,
        user: user_id (*),
        delegator(name)
      `);

      if (UserRole !== "admin") {
        query = query.eq("trader_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getDoneOrders = createAsyncThunk(
  "orders/getDoneOrders",
  async (_, { rejectWithValue }) => {
    try {
      const userId = sessionStorage.getItem("userID");

      let query = supabase.from("orders").select(`
        *,
        user: user_id (*),
         trader_id (name),
        delegator(name)
      `)
      .eq("status", "done"); 

      if (UserRole !== "admin") {
        query = query.eq("trader_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getReturnOrders = createAsyncThunk(
  "orders/getDoneOrders",
  async (_, { rejectWithValue }) => {
    try {
      const userId = sessionStorage.getItem("userID");

      let query = supabase.from("orders").select(`
        *,
        user: user_id (*),
         trader_id (name),
        delegator(name)
      `)
      .eq("status", "returns"); 

      if (UserRole !== "admin") {
        query = query.eq("trader_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Create a new Order
export const addOrder = createAsyncThunk(
  "orders/addOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("orders").insert(orderData).select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Update Order
export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(updatedData)
        .eq("id", id)
        .select(`
          *,

          user: user_id (*)
        `);
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete single Order by ID
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete multiple selected Orders
export const deleteSelectedOrders = createAsyncThunk(
  "orders/deleteSelectedOrders",
  async (selectedOrders, { rejectWithValue }) => {
    try {
      const ids = selectedOrders.map(order => order.id);
      const { error } = await supabase.from("orders").delete().in("id", ids);
      if (error) throw error;
      return ids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Orders Slice
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // FetchDone
      .addCase(getDoneOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoneOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getDoneOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(addOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })
      .addCase(addOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Single
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(deleteSelectedOrders.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIds = action.payload;
        state.orders = state.orders.filter(order => !deletedIds.includes(order.id));
      })
      .addCase(deleteSelectedOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ordersSlice;
