import React from 'react';
import op from 'object-path';
import cn from 'classnames';
import Linear from './Linear';
import Feather from './Feather';
import PropTypes from 'prop-types';
import Button from 'reactium-ui/Button';

const icons = {
    Feather,
    Linear,
};

const ENUMS = {
    COLOR: { ...Button.ENUMS.COLOR },
};

delete ENUMS.COLOR.CLEAR;

const Icon = ({ size, color, name, ...props }) => {
    const { className, namespace } = props;

    const Ico = op.get(Icon.icons, name);

    if (!Ico) {
        return null;
    }

    const cx = cn({
        [className]: !!className,
        [color]: !!color,
        [namespace]: !!namespace,
    });

    return Ico({ ...props, width: size, height: size, className: cx });
};

Icon.ENUMS = ENUMS;
Icon.icons = {
    Feather,
    Linear,
};

Object.entries(Icon.icons).forEach(([key, value]) => {
    Icon[key] = value;
});

Icon.propTypes = {
    className: PropTypes.string,
    color: PropTypes.oneOf(Object.values(ENUMS.COLOR)),
    namespace: PropTypes.string,
    size: PropTypes.number,
};
Icon.defaultProps = {
    namespace: 'ar-icon',
    size: 24,
};

export { Icon, Icon as default, Feather, Linear };
