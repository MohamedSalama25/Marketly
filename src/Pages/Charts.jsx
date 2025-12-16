import { useEffect } from "react";
import ActivityFeed from "../Components/ChartsComponents/ActivityFeed";
import ChartSection from "../Components/ChartsComponents/ChartSection";
import StatsGrid from "../Components/ChartsComponents/StatsGrid";
import TableSection from "../Components/ChartsComponents/TableSection";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../Redux/slices/OrdersSlice";
import { fetchProducts } from "../Redux/slices/ProductSlice";
import { fetchUsers } from "../Redux/slices/Users";
import { fetchDelegates } from "../Redux/slices/DelegatesSlice";

function Charts() {
  const dispatch = useDispatch();
  const UserRole = useSelector((state) => state.Token.UserRole);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchDelegates());
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (UserRole) {
      dispatch(getOrders());
    }
  }, [dispatch, UserRole]);

  return (
    <div className="pt-3 d-flex flex-column gap-4">
      <StatsGrid />
      <ChartSection />
      <div className="row g-4">
        <div className="col-xl-8">
          <TableSection />
        </div>
        <div className="col-xl-4">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

export default Charts;
