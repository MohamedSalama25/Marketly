import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";
import { UserRole } from "./token";

// دالة واحدة لجلب عناصر الطلبات حسب الصلاحية
export const fetchOrderItems = createAsyncThunk(
  "orderItems/fetchOrderItems",
  async (_, { rejectWithValue }) => {
     const token = sessionStorage.getItem('userID');
    try {
      let query = supabase
        .from("order_items")
        .select(`
          *,
          product_id (
            name,
            image,
            traderprice,
            company_id (
              name
            ),
            category_id (
              name
            )
          ),
          order_id (
            status,
            trader_id
          )
        `);

      if (UserRole !== "admin") {
        // إذا كان تاجر، هات فقط العناصر المرتبطة بـ trader_id
        query = query.eq("order_id.trader_id", token);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderItemsSlice;