import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
    useAsyncEffect,
    useHandle,
    useRoles,
} from 'reactium-core/sdk';

export default ({ list: List }) => {
    const ddRef = useRef();

    const state = op.get(List, 'state', {});
    const roles = useRoles() || {};

    const onItemSelect = ({ item }) => {
        List.setState({ role: item.name, roleLabel: item.label });
    };

    const clearRole = () => {
        List.setState({ role: null });
    };

    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        type: Button.ENUMS.TYPE.BUTTON,
        style: { width: 40, height: 40, padding: 0 },
    };

    const getRoleName = role => {};

    return (
        <Dropdown
            align={Dropdown.ENUMS.ALIGN.RIGHT}
            data={Object.values(roles)}
            onItemSelect={onItemSelect}
            maxHeight='calc(100vh - 150px)'
            ref={ddRef}
            selection={[op.get(state, 'role', null)]}
            valueField='name'>
            <div className='flex middle'>
                {op.get(state, 'role') && (
                    <Button
                        className='mr-xs-8 ml-xs-12'
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={() => clearRole()}
                        outline
                        size={Button.ENUMS.SIZE.XS}
                        style={{ padding: '2px 4px 2px 5px', maxHeight: 20 }}
                        type={Button.ENUMS.TYPE.BUTTON}>
                        {state.roleLabel}
                        <Icon
                            name='Feather.X'
                            size={14}
                            className='ml-xs-4'
                            style={{ marginTop: -1 }}
                        />
                    </Button>
                )}
                <Button {...buttonProps} data-dropdown-element>
                    <Icon name='Feather.Filter' size={20} />
                </Button>
            </div>
        </Dropdown>
    );
};
