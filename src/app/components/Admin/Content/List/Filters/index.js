import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, { useAsyncEffect } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export default ({ list, ...props }) => {
    const ddRef = useRef();
    const { setState, state = {} } = list;

    const status = op.get(state, 'status');

    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        type: Button.ENUMS.TYPE.BUTTON,
        style: { width: 40, height: 40, padding: 0 },
    };

    const statuses = () =>
        _.chain([
            'ALL',
            op
                .get(state, 'contentType.fields.publisher.statuses', '')
                .split(','),
            'TRASH',
        ])
            .flatten()
            .uniq()
            .value()
            .map(item => ({ label: item, value: item }));

    useEffect(() => {
        ddRef.current.setState({ selection: [op.get(state, 'status')] });
    }, [op.get(state, 'status')]);

    return (
        <Dropdown
            align={Dropdown.ENUMS.ALIGN.RIGHT}
            data={statuses()}
            onItemSelect={({ item }) =>
                setState({ busy: true, status: item.value })
            }
            ref={ddRef}
            selection={[op.get(state, 'status', null)]}>
            <div className='flex middle'>
                {status && (
                    <Button
                        className='mr-xs-8 ml-xs-12'
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={() => setState({ busy: true, status: null })}
                        outline
                        size={Button.ENUMS.SIZE.XS}
                        style={{ padding: '2px 4px 2px 5px', maxHeight: 20 }}
                        type={Button.ENUMS.TYPE.BUTTON}>
                        {status}
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
