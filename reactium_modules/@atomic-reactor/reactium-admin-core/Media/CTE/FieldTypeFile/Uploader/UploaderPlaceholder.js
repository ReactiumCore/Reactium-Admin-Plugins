import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const Ico = (props) => {
    const { Icon } = useHookComponent('ReactiumUI');

    return typeof op.get(props, 'icon') === 'string' ? (
        <Icon name={props.icon} size={96} />
    ) : (
        props.icon
    );
};

export const UploaderPlaceholder = ({
    children,
    count,
    buttonLabel,
    maxFiles,
    namespace,
    empty,
    uploader,
    ...props
}) => {
    const { Button } = useHookComponent('ReactiumUI');

    const cx = useMemo(() => Reactium.Utils.cxFactory(namespace), [namespace]);

    const visible = useMemo(() => Boolean(count < maxFiles), [count, maxFiles]);

    const btnSize = empty ? Button.ENUMS.SIZE.MD : Button.ENUMS.SIZE.SM;

    const btnAppearance = empty ? Button.ENUMS.APPEARANCE.PILL : null;

    return !visible ? null : (
        <div className={cn(cx('box-placeholder'), { empty })}>
            {empty && <Ico {...props} />}
            <div className='placeholder'>{children}</div>
            <Button
                size={btnSize}
                children={buttonLabel}
                onClick={uploader.browse}
                appearance={btnAppearance}
            />
        </div>
    );
};

UploaderPlaceholder.propTypes = {
    buttonLabel: PropTypes.node,
    children: PropTypes.node,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    namespace: PropTypes.string,
    empty: PropTypes.bool,
};

UploaderPlaceholder.defaultProps = {
    buttonLabel: __('Select File'),
    icon: 'Linear.CloudUpload',
    namespace: 'ar-field-type-file',
};
