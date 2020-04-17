import React from 'react';
import DraggableList from './index';

const DLItem = ({ number = 1, text = '', height = 100 }) => {
    return (
        <div
            className={`dl-example-item dl-example-item-${number}`}
            style={{ height }}>
            {text}
        </div>
    );
};

export default {
    path: ['/use-drag', '/use-gesture', '/draggable-list'],
    component: () => (
        <div className='p-xs-20'>
            <DraggableList>
                <DLItem number={1} text={'Lorem'} height={100} />
                <DLItem number={2} text={'ipsum'} height={100} />
                <DLItem number={3} text={'dolor'} height={100} />
                <DLItem number={4} text={'sit'} height={100} />
                <DLItem number={1} text={'amet'} height={100} />
            </DraggableList>
        </div>
    ),
};
