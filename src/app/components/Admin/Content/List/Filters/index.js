import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, { useAsyncEffect } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';

export default ({ list, ...props }) => {
    const { setState, state = {} } = list;

    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        type: Button.ENUMS.TYPE.BUTTON,
        style: { width: 40, height: 40, padding: 0 },
    };

    const statuses = () =>
        _.chain([
            { label: 'ALL', value: null },
            op
                .get(state, 'contentType.fields.publisher.statuses', '')
                .split(',')
                .map(item => ({ label: item, value: item })),
            { label: 'TRASHED', value: 'TRASH' },
        ])
            .flatten()
            .uniq()
            .value();

    return (
        <Dropdown
            align={Dropdown.ENUMS.ALIGN.RIGHT}
            data={statuses()}
            onItemSelect={({ item }) => setState({ status: item.value })}
            selection={[op.get(state, 'status', null)]}>
            <Button {...buttonProps} data-dropdown-element>
                <Icon name='Feather.Filter' size={20} />
            </Button>
        </Dropdown>
    );
};
