import React from 'react';

export default ({ children, ...props }) => {
    return (
        <div contentEditable={false} className='ar-rte-video'>
            {children}
            <video width='100%' height='100%' controls>
                <source src={props.src} type={`video/${props.ext}`} />
            </video>
        </div>
    );
};
