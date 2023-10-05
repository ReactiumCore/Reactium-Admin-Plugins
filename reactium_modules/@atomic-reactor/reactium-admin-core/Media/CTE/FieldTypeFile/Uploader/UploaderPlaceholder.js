import op from 'object-path';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const Ico = (props) => {
    const { Icon } = useHookComponent('ReactiumUI');

    return (
        <span className='mb-xs-20'>
            {typeof op.get(props, 'icon') === 'string' ? (
                <Icon name={props.icon} size={96} />
            ) : (
                props.icon
            )}
        </span>
    );
};

export const UploaderPlaceholder = ({
    children,
    buttonLabel,
    namespace,
    visible,
    ...props
}) => {
    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    return !visible ? null : (
        <div className={cx('box-placeholder')}>
            <Ico {...props} />
            {children}
            <span className='mt-xs-32 btn-primary-md-pill'>{buttonLabel}</span>
        </div>
    );
};

UploaderPlaceholder.propTypes = {
    buttonLabel: PropTypes.node,
    children: PropTypes.node,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    namespace: PropTypes.string,
    visible: PropTypes.bool,
};

UploaderPlaceholder.defaultProps = {
    buttonLabel: __('Select File'),
    icon: 'Linear.CloudUpload',
    namespace: 'ar-field-type-file',
};
