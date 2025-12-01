import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";

// ✅ تسجيل مستخدم جديد (Auth + users)
export const UserRegister = createAsyncThunk(
  "users/UserRegister",
  async (userData, { rejectWithValue }) => {
    try {
      // التحقق إذا كان البريد الإلكتروني موجود مسبقًا
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", userData.email)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) throw new Error("هذا البريد مسجل مسبقًا.");

      // 1. إنشاء المستخدم في جدول auth
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            emailRedirectTo: "", // مش محتاجين redirect
          },
        });

      if (signUpError) throw signUpError;

      const { user } = signUpData;
      if (!user || !user.id) throw new Error("فشل إنشاء المستخدم في auth");

      // 2. إضافة بياناته في جدول users وربطها بنفس الـ id
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: user.id, // مهم جدًا الربط بين auth و users
          ...userData,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ جلب المستخدمين
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ تحديث مستخدم
// export const updateUser = createAsyncThunk(
//   "users/updateUser",
//   async ({ id, updatedData }, { rejectWithValue }) => {
//     try {
//       const { data, error } = await supabase
//         .from("users")
//         .update(updatedData)
//         .eq("id", id)
//         .select();
//       if (error) throw error;
//       return data[0];
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      // console.log("🔁 trying to update user with id:", id);
      const { data, error } = await supabase
        .from("users")
        .update(updatedData)
        .eq("id", id)
        .select();

      // console.log("📦 result:", data, error);

      if (error) throw error;
      if (!data || data.length === 0)
        throw new Error("No data returned from update");

      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// ✅ تحديث مجموعة من المستخدمين
export const updateSelectedUsers = createAsyncThunk(
  "users/updateSelectedUsers",
  async ({ userIds, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updatedData)
        .in("id", userIds)
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ حذف مستخدم
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) {
        console.error("Delete error:", error.message);
        throw error;
      }
      return id;
    } catch (error) {
      console.error("Error in deleteUser:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Slice
const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // تسجيل مستخدم
      .addCase(UserRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UserRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(UserRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // جلب المستخدمين
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // تحديث مستخدم
      // .addCase(updateUser.fulfilled, (state, action) => {
      //   const index = state.users.findIndex(
      //     (user) => user.id === action.payload.id
      //   );
      //   if (index !== -1) {
      //     state.users[index] = action.payload;
      //   }
      // })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        // ✅ لو التحديث فقط على كلمة المرور، تجاهل التعديل في الواجهة
        if (
          Object.keys(updatedUser).length === 2 && // id + password
          updatedUser.password &&
          updatedUser.id
        ) {
          return;
        }

        const index = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload;
      })

      // تحديث مجموعة
      .addCase(updateSelectedUsers.fulfilled, (state, action) => {
        action.payload.forEach((updatedUser) => {
          const index = state.users.findIndex(
            (user) => user.id === updatedUser.id
          );
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        });
      })
      .addCase(updateSelectedUsers.rejected, (state, action) => {
        state.error = action.payload;
      })

      // حذف
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default usersSlice;
