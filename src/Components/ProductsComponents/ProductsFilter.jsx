import GovernorateFilter from "./FilteredComponents/CatFilter";
import LightButton from "../globalComonents/LightButton";
import RoleFilter from "./FilteredComponents/CompanyFilter";
import NameSearch from "./FilteredComponents/NameSearch";
import EmailSearch from "./FilteredComponents/TraderSearch";
import PrimaryButton from "../globalComonents/PrimaryButton";
import TraderSearch from "./FilteredComponents/TraderSearch";
import { UserRole } from "../../Redux/slices/token";

function ProductsFilter({
  searchName,
  setSearchName,
  searchTrader,
  setSearchTrader,
  selectedCat,
  setselectedCat,
  selectedCompany,
  setselectedCompany,
  onSearchClick,
  selectNotPublished,
  onResetFilters,
}) {
  return (
    <div className="d-flex gap-3 align-items-center justify-content-between w-100 px-2 mt-2 ">
      <NameSearch
        searchName={searchName}
        setSearchName={setSearchName}
        onSearchClick={onSearchClick}
      />
      {UserRole === "admin" && (
        <TraderSearch
          searchTrader={searchTrader}
          setSearchTrader={setSearchTrader}
          onSearchClick={onSearchClick}
        />
      )}

      <GovernorateFilter
        selectedCat={selectedCat}
        setselectedCat={setselectedCat}
      />

      <RoleFilter
        selectedRole={selectedCompany}
        setSelectedRole={setselectedCompany}
      />

      <div style={{ minWidth: "115px" }}>
        <LightButton
          label="قيد المراجعة"
          onClick={selectNotPublished}
          className="bg-warning text-white w-100"
        />
      </div>

      <div style={{ width: "120px" }}>
        <LightButton label="بحث" onClick={onSearchClick} />
      </div>

      <PrimaryButton
        label="إلغاء "
        onClick={onResetFilters}
        // className="btn btn-outline-secondary me-2"
      />
    </div>
  );
}

export default ProductsFilter;
