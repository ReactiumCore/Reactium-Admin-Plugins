import _ from 'underscore';
import React, { useMemo } from 'react';
import { Button } from '@atomic-reactor/reactium-ui';

export const TextAlignSelect = ({ align = 'align-left', buttons, onClick }) => {
    const buttonList = _.where(buttons, { formatter: 'alignment' });
    return useMemo(
        () => (
            <>
                <h3 className='heading'>Alignment</h3>
                <div className='formatter-text-align'>
                    <div className='btn-group'>
                        {buttonList.map(({ id, button: Button }) => (
                            <Button
                                active={id === align}
                                onClick={onClick}
                                data-align={id}
                                key={id}
                                size='sm'
                                color='clear'
                            />
                        ))}
                    </div>
                </div>
            </>
        ),
        [align, buttons],
    );
};
