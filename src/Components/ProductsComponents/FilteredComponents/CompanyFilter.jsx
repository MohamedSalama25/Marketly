import React, { useEffect } from 'react'
import PrimarySelector from '../../globalComonents/PrimarySelector'
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompanies } from '../../../Redux/slices/CompaniesSlice';

function RoleFilter({ selectedRole, setSelectedRole }) {

   const dispatch=useDispatch();
 const {companies}=useSelector((state)=>state.Companies);
 let OptionsData=[];
companies.forEach(cat => {
  OptionsData.push({
    label:cat.name,
    value:cat.name
  })
});

  useEffect(() => {
      dispatch(fetchCompanies());
    }, []);

    return (
        <div style={{width:"220px"}}>
            <PrimarySelector
                options={OptionsData}
                label='إختر شركة'
                value={selectedRole}
                onChange={(val) => setSelectedRole(val)}
            />
        </div>
    )
}

export default RoleFilter;