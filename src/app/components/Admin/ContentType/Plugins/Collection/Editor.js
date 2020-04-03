import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

import {
    Button,
    Checkbox,
    Dialog,
    Dropdown,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

export const Editor = props => {
    const { editor, fieldName, required } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        name: fieldName,
        ref: inputRef,
    };

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <div className='input-group'>COLLECTION</div>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};
