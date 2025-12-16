import React, { useEffect } from 'react'
import PrimarySelector from '../../globalComonents/PrimarySelector'
import { useDispatch, useSelector } from 'react-redux';
import { GetCategories } from '../../../Redux/slices/Categories';

function GovernorateFilter({ selectedCat, setselectedCat }) {
const dispatch=useDispatch();
 const {categories}=useSelector((state)=>state.Categories);
 let OptionsData=[];
categories.forEach(cat => {
  OptionsData.push({
    label:cat.name,
    value:cat.name
  })
});

  useEffect(() => {
      dispatch(GetCategories());

    }, []);
  return (
    <div style={{ width:"200px" }}>
      <PrimarySelector
        options={OptionsData}
       label='إختر صنف'
        value={selectedCat}
        onChange={(val) => setselectedCat(val)}
      />
    </div>
  )
}

export default GovernorateFilter;