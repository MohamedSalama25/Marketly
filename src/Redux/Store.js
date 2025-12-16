import { configureStore } from "@reduxjs/toolkit";

import categoriesSlice from "./slices/Categories";
import usersSlice from "./slices/Users";
import productSlice from "./slices/ProductSlice";
import ordersSlice from "./slices/OrdersSlice";
import orderItemsSlice from "./slices/OrderItems";
import UnitsSlice from "./slices/units";
import CompaniesSlice from "./slices/CompaniesSlice";
import delegatesSlice from "./slices/DelegatesSlice";
import TokenSlice from "./slices/token";
import complaintsSlice from "./slices/Complaints";
import messagesSlice from "./slices/MessagesSlice";
import testimonialsReducer  from "./slices/testimonialsSlice";

export const Store = configureStore({
  reducer: {
    Users: usersSlice.reducer,
    Categories: categoriesSlice.reducer,
    Units: UnitsSlice.reducer,
    Products: productSlice.reducer,
    Orders: ordersSlice.reducer,
    OrderItems: orderItemsSlice.reducer,
    Companies: CompaniesSlice.reducer,
    messages: messagesSlice.reducer,
    Delegates: delegatesSlice.reducer,
    Token: TokenSlice.reducer,
    Complaints: complaintsSlice.reducer,
     Testimonials: testimonialsReducer,
  },
});
