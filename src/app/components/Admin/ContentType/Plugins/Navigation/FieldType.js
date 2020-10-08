import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import queryActions from './queryActions';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

import {
    Alert,
    Button,
    Dropdown,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const Help = () => {
    return (
        <div className='help'>
            <Alert
                className='mb-xs-20'
                color={Alert.ENUMS.COLOR.INFO}
                dismissable={false}
                icon={<Icon name='Feather.Info' />}>
                {__(
                    'This field type adds a navigation selector to your content.',
                )}
            </Alert>
        </div>
    );
};

// -----------------------------------------------------------------------------
// <FieldType />
// -----------------------------------------------------------------------------
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const render = () => {
        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                <input type='hidden' name='query' />
                <input type='hidden' name='collection' />
                <input type='hidden' name='targetClass' />
                <div className='field-type-collection'>
                    <Help />
                </div>
            </FieldTypeDialog>
        );
    };

    return render();
};
