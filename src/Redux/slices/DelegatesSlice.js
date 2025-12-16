import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/supabaseClient";
import { UserRole } from "./token";

// ✅ Fetch Delegates - Admin gets all, Trader gets only their own
export const fetchDelegates = createAsyncThunk(
  "delegates/fetchDelegates",
  async (_, { rejectWithValue }) => {
    try {
      const userId = sessionStorage.getItem("userID");
     

      let query = supabase.from("delegates").select("*");

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

// ✅ Create Delegate
// export const createDelegate = createAsyncThunk(
//   "delegates/createDelegate",
//   async (delegateData, { rejectWithValue }) => {
//     try {
//       const { data, error } = await supabase
//         .from("delegates")
//         .insert(delegateData)
//         .select();
//       if (error) throw error;
//       return data[0];
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const createDelegate = createAsyncThunk(
  "delegates/createDelegate",
  async (delegateData, { rejectWithValue }) => {
    try {
      // const phoneAsEmail = `${delegateData.phone}@delegate.com`;
      const phoneAsEmail = `${delegateData.phone}`;

      // التحقق من وجود مستخدم بنفس رقم الهاتف (عن طريق الإيميل المولد)
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", phoneAsEmail)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) throw new Error("يوجد مستخدم بنفس رقم الهاتف.");
      
      const userId = sessionStorage.getItem("userID");
      // 1. إدخال بيانات المندوب في جدول users
      const userPayload = {
        name: delegateData.name,
        email: phoneAsEmail,
        password: delegateData.phone,
        location: "",
        role: "delegate",
        isBlocked: false,
        phone: delegateData.phone,
        governorate: delegateData.routes?.[0]?.governorate || "",
        city: "",
        image: delegateData.image || null,
        routes: null,
        trader_id: userId,
      };

      const { data: insertedUser, error: insertUserError } = await supabase
        .from("users")
        .insert(userPayload)
        .select("id")
        .single();

      if (insertUserError) throw insertUserError;

      const delegateId = insertedUser.id;
      console.log("Delegate User Ud : " , delegateId)
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      console.log("🧾 Logged-in user:", user);
      console.log("❗Auth Error:", authError);

      // 2. إدخال بياناته في جدول delegates
      const delegatePayload = {
        id: delegateId,
        name: delegateData.name,
        phone: delegateData.phone,
        image: delegateData.image,
        trader_id: userId,
        routes: delegateData.routes,
      };

      // 👇 اطبع البيانات هنا
      console.log("Delegate Payload to be inserted:", delegatePayload);

      const { data, error } = await supabase
        .from("delegates")
        .insert(delegatePayload)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ✅ Update Single Delegate
export const updateDelegate = createAsyncThunk(
  "delegates/updateDelegate",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("delegates")
        .update(updatedData)
        .eq("id", id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Update Multiple Delegates
export const updateSelectedDelegates = createAsyncThunk(
  "delegates/updateSelectedDelegates",
  async ({ delegateIds, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("delegates")
        .update(updatedData)
        .in("id", delegateIds)
        .select();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete Delegate
export const deleteDelegate = createAsyncThunk(
  "delegates/deleteDelegate",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("delegates").delete().eq("id", id);
      if (error) throw error;
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Slice
const delegatesSlice = createSlice({
  name: "delegates",
  initialState: {
    delegates: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDelegates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDelegates.fulfilled, (state, action) => {
        state.loading = false;
        state.delegates = action.payload;
      })
      .addCase(fetchDelegates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createDelegate.fulfilled, (state, action) => {
        state.delegates.push(action.payload);
      })
      .addCase(createDelegate.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Single
      .addCase(updateDelegate.fulfilled, (state, action) => {
        const index = state.delegates.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.delegates[index] = action.payload;
        }
      })
      .addCase(updateDelegate.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Update Multiple
      .addCase(updateSelectedDelegates.fulfilled, (state, action) => {
        action.payload.forEach((updated) => {
          const index = state.delegates.findIndex((d) => d.id === updated.id);
          if (index !== -1) {
            state.delegates[index] = updated;
          }
        });
      })
      .addCase(updateSelectedDelegates.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteDelegate.fulfilled, (state, action) => {
        state.delegates = state.delegates.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDelegate.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default delegatesSlice;
