import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

const Clients = () => {
    return (
        <div className='syndicate-clients'>
            <h2 className='h3'>Syndication Clients</h2>

            <div className='syndicate-clients-list'></div>
        </div>
    );
};

export default Clients;
