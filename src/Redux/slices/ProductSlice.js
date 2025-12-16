import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../Supabase/SupabaseClient";
import { UserRole } from "./token";


export const fetchProducts = createAsyncThunk(
  "products/fetchproducts",
  async (_, { rejectWithValue }) => {
    try {
      const userId = sessionStorage.getItem("userID");

      let query = supabase
        .from("products")
        .select(`
          *,
          category:category_id (*),
          trader:trader_id (*),
          company:company_id (name, image)
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

// ✅ Create a new product
export const createProduct = createAsyncThunk(
  "products/createproduct",
  async (productData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select(`
          *,
          category:category_id (*),
          trader:trader_id (*),
          company:company_id (name, image)
        `);
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Update a product
export const updateProduct = createAsyncThunk(
  "products/updateproduct",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(updatedData)
        .eq("id", id)
        .select(`
          *,
          category:category_id (*),
          trader:trader_id (*),
          company:company_id (name, image)
        `);
      if (error) throw error;
      return data[0];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete single product by ID
export const deleteProduct = createAsyncThunk(
  "products/deleteproduct",
  async ({ id, image }, { rejectWithValue }) => {
    try {
      let imagePath = null;
      if (image) {
        const parts = image.split("/");
        const filename = parts.pop();
        imagePath = decodeURIComponent(filename);
      }

      if (imagePath) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove([imagePath]);

        if (storageError) {
          console.error("❌ Storage deletion error:", storageError);
          throw storageError;
        }
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Delete multiple selected products
export const deleteSelectedProduct = createAsyncThunk(
  "products/deleteSelected",
  async (selectedProducts, { rejectWithValue }) => {
    try {
      const imagePaths = selectedProducts
        .map((p) => {
          const url = p.image;
          if (!url) return null;
          const parts = url.split("/");
          return parts.length > 0 ? decodeURIComponent(parts.pop()) : null;
        })
        .filter(Boolean);

      console.log("🧹 حذف الصور التالية من Supabase:", imagePaths);

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("products")
          .remove(imagePaths);

        if (storageError) {
          console.error("❌ خطأ أثناء حذف الصور:", storageError);
          throw storageError;
        }
      }

      const ids = selectedProducts.map((p) => p.id);
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;

      return ids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Optional: Delete image directly from storage
export async function deleteImageFromStore(imageUrl) {
  if (!imageUrl) return;

  try {
    const storageBase = "https://auxwhdusfpgyzbwgjize.supabase.co/storage/v1/object/public/products/";

    if (!imageUrl.startsWith(storageBase)) {
      console.warn("الرابط لا ينتمي لمجلد التخزين المتوقّع");
      return;
    }

    const imagePath = decodeURIComponent(imageUrl.replace(storageBase, ""));

    const { error: storageError } = await supabase.storage
      .from("products")
      .remove([imagePath]);

    if (storageError) {
      console.error(" Storage deletion error:", storageError);
      throw storageError;
    }

    console.log("✅ Image deleted from storage:", imagePath);
  } catch (error) {
    console.error("❌ Unexpected error while deleting image:", error);
  }
}

// ✅ Product Slice
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.products[index] = action.payload;
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Single
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Multiple
      .addCase(deleteSelectedProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSelectedProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((p) => !action.payload.includes(p.id));
        state.error = null;
      })
      .addCase(deleteSelectedProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice;
