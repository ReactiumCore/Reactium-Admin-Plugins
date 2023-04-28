import _ from 'underscore';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Reactium, { useHookComponent, useStatus } from 'reactium-core/sdk';
import React, {
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Placeholder
 * -----------------------------------------------------------------------------
 */

const types = ['input', 'textarea'];

export const Placeholder = ({ children, className, namespace, ...props }) => {
    const { FormContext } = useHookComponent('ReactiumUI');
    const Form = useContext(FormContext);

    const ref = useRef();

    const cx = Reactium.Utils.cxFactory(namespace);

    const [active, setActive, isActive] = useStatus(false);

    const [, setInit, isInit] = useStatus(false);

    const [, setUpdate] = useState();

    const update = () => setUpdate(Date.now());

    const cname = useMemo(() => cn(cx(), className), [className]);

    const _isValue = value => _.compact([value]).length > 0;

    const _onChange = callback => e => {
        const isValue = _isValue(e.target.value);

        setActive(isValue);

        update();

        if (typeof callback === 'function') callback(e);
    };

    const childClone = child => {
        if (types.includes(child.type) && child.props.placeholder) {
            const elm = React.cloneElement(child, {
                onChange: _onChange(child.props.onChange),
                onBlur: _onChange(child.props.onBlur),
                placeholder: undefined,
            });

            ref.current = elm;

            if (!isInit(true)) {
                const isValue = _isValue(
                    elm.props.value || elm.props.defaultValue,
                );
                setActive(isValue);
            }

            return (
                <div
                    className={cn(cx('container'), { active: isActive(true) })}>
                    {elm}
                    <div className={cname} {...props}>
                        {child.props.placeholder}
                    </div>
                </div>
            );
        } else {
            console.warn(
                `<Placeholder /> child must be of type [${types.join(
                    '|',
                )}] and specify the 'placeholder' attribute.`,
            );
            return child;
        }
    };

    const childMap = children => {
        const invalid = React.Children.count(children) > 1;

        if (invalid) {
            console.warn(
                `<Placeholder /> children length must be 1 and of type [${types.join(
                    '|',
                )}]`,
            );
        }

        return invalid ? children : React.Children.map(children, childClone);
    };

    useEffect(() => {
        if (isInit(true) || !ref.current) return;

        const isValue = _isValue(
            ref.current.props.value || ref.current.props.defaultValue,
        );

        if (isValue !== active) {
            setActive(isValue);
            update();
        }

        setInit(true);
    });

    useLayoutEffect(() => {
        if (!ref.current) return;
        if (!ref.current.props.name) return;

        const { name: key } = ref.current.props;

        let elm = _.findWhere(Form.elements(), { key });
        elm = elm ? elm.ref : null;
        if (!elm) return;

        if (String(elm.value).length > 0 && !isActive(true)) {
            setActive(true, true);
        }

        if (String(elm.value).length < 1 && isActive(true)) {
            setActive(false, true);
        }
    });

    return childMap(children);
};

Placeholder.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

Placeholder.defaultProps = {
    namespace: 'placeholder',
};
