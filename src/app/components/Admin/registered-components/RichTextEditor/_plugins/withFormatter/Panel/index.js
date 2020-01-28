import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import EventForm from './EventForm';
import { useSlate } from 'slate-react';
import Reactium, { useDerivedState, useEventHandle } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */
let Panel = ({ children, ...props }, ref) => {
    const formRef = useRef();

    const editor = useSlate();

    const [selection] = useState(editor.selection);

    // Initial state
    const [state, setState] = useDerivedState(props);

    const [value, setValue] = useState({ test: 123 });

    const [defaultValue] = useState({ test: 123 });

    // classname and namespace
    const cname = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // className prefixer
    const cx = cls =>
        _.chain([op.get(state, 'className', op.get(state, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    // Handle
    const _handle = () => ({
        setState,
        state,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        if (!formRef.current) return;
        formRef.current.addEventListener('status', console.log);

        return () => {
            formRef.current.removeEventListener('status', console.log);
        };
    });

    // Renderers
    const render = () => {
        return (
            <EventForm ref={formRef} required={['test']} showError>
                <input type='text' name='test' />
                <button
                    type='button'
                    onClick={() => {
                        formRef.current.focus('test');
                    }}>
                    Focus
                </button>
            </EventForm>
        );
    };

    return render();
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'formatter',
};

export { Panel as default };
