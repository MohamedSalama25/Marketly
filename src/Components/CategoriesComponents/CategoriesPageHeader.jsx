import CategoriesUnitsModal from "../modalsComponents/CategoriesUnitsModal";

function CategoriesPageHeader({ title, flag, onAdd, isAdmin }) {
  return (
    <>
      <header className="d-flex justify-content-between w-100 px-1 pt-3">
        <h3>{title}</h3>
        {isAdmin && <CategoriesUnitsModal type={flag} onAdd={onAdd} />}
      </header>
    </>
  );
}

export default CategoriesPageHeader;
