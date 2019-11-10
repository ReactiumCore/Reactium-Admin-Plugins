import React from 'react';
import MenuItem from 'components/Admin/MenuItem';

export default () => (
    <>
        <div className='menu-break' />
        <MenuItem label='Sign Out' route='/logout' icon='Linear.PowerSwitch' />
    </>
);
