import cn from 'classnames';
import PropTypes from 'prop-types';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import React, {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const ToggleContainer = ({ isLabel, ...props }) =>
    isLabel === true ? <span {...props} /> : <label {...props} />;

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Toggle
 * -----------------------------------------------------------------------------
 */
let Toggle = ({ className, namespace, size, style, ...props }, ref) => {
    const inputRef = useRef();

    const { FormRegister } = useHookComponent('ReactiumUI');

    const cx = Reactium.Utils.cxFactory(namespace);

    const [isLabel, setIsLabel] = useState(true);

    const cname = useMemo(
        () => cn(cx(), className, { checked: props.checked }),
        [props.checked],
    );

    const height = useMemo(() => size, [size]);

    const width = useMemo(() => props.width || size * 2, [props.width, size]);

    const containerStyle = useMemo(() => ({ ...style, width }), []);

    const inputProps = useMemo(() => ({ ...props, width: undefined }), []);

    useLayoutEffect(() => {
        if (!inputRef.current) return;
        const label = !!inputRef.current.closest('label');
        if (isLabel !== label) setIsLabel(label);
    }, []);

    useImperativeHandle(ref, () => inputRef.current);

    return (
        <FormRegister>
            <ToggleContainer
                isLabel={isLabel}
                className={cname}
                style={containerStyle}>
                <input {...inputProps} ref={inputRef} />
                <span style={{ width, height }}>
                    <span style={{ width: height - 4, height: height - 4 }} />
                </span>
            </ToggleContainer>
        </FormRegister>
    );
};

Toggle = forwardRef(Toggle);

Toggle.SIZE = {
    XS: 17,
    SM: 25,
    MD: 29,
    LG: 37,
};

Toggle.TYPE = {
    RADIO: 'radio',
    CHECKBOX: 'checkbox',
};

Toggle.propTypes = {
    checked: PropTypes.bool,
    className: PropTypes.string,
    namespace: PropTypes.string,
    size: PropTypes.number,
    style: PropTypes.object,
    type: PropTypes.oneOf(Object.values(Toggle.TYPE)),
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),
};

Toggle.defaultProps = {
    namespace: 'toggle',
    size: Toggle.SIZE.XS,
    type: Toggle.TYPE.CHECKBOX,
    value: true,
};

export { Toggle };
