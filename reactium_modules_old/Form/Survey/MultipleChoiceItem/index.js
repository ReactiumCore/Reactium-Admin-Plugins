import PropTypes from 'prop-types';
import { cxFactory, useHookComponent } from 'reactium-core/sdk';
import React, { forwardRef } from 'react';
import cn from 'classnames';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: MultipleChoiceItem
 * -----------------------------------------------------------------------------
 */
let MultipleChoiceItem = ({ namespace, name, label, ...inputAttrs }, ref) => {
    const { FormRegister } = useHookComponent('ReactiumUI');
    const cx = cxFactory(namespace);
    const cname = cn(cx());

    return (
        <FormRegister>
            <div className={cname}>
                <input
                    id={name}
                    type='checkbox'
                    name={name}
                    {...inputAttrs}
                    ref={ref}
                />
                <label htmlFor={name}>{label}</label>
            </div>
        </FormRegister>
    );
};

MultipleChoiceItem = forwardRef(MultipleChoiceItem);

MultipleChoiceItem.propTypes = {
    namespace: PropTypes.string,
};

MultipleChoiceItem.defaultProps = {
    namespace: 'answer-multi',
};

export default MultipleChoiceItem;
