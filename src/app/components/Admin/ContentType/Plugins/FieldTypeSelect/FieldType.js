import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldType
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { id } = props;

    const refs = useRef({});

    const [state, setState] = useDerivedState({
        options: [],
    });

    const { DragHandle } = props;
    const { Button, Checkbox, Icon } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('template-cte');

    const onAddClick = () => {
        const label = op.get(refs.current, 'label').value;
        const value = op.get(refs.current, 'value').value;

        let { options = [] } = state;

        options = _.flatten([options]);
        options.push({ label, value });
        options = _.uniq(options);

        refs.current.label.value = '';
        refs.current.value.value = '';

        refs.current.label.focus();

        setState({ options });
    };

    const onChange = e => {
        let { options } = state;
        const { value } = e.currentTarget;
        const { index, key } = e.currentTarget.dataset;
        op.set(options, [index, key], value);
        setState({ options });
    };

    const onDelete = index => {
        let { options = [] } = state;
        options.splice(index, 1);
        setState({ options });
    };

    const onEnterPress = e => {
        if (e.which === 13) {
            e.preventDefault();
            onAddClick();
        }
    };

    const beforeSave = ({ fieldId, fieldValue }) => {
        if (fieldId === id) op.set(fieldValue, 'options', state.options);
    };

    const formChange = ({ value }) => {
        if (value) setState({ options: op.get(value, 'options', []) });
    };

    const onLoad = () => {
        const hooks = [
            Reactium.Hook.register(`field-type-form-change-${id}`, formChange),
            Reactium.Hook.registerSync('content-type-form-save', beforeSave),
        ];

        return () => {
            hooks.forEach(hookId => Reactium.Hook.unregister(hookId));
        };
    };

    const options = () => {
        let options = op.get(state, 'options');
        options = _.compact(options);
        return options;
    };

    useEffect(onLoad);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <div className='flex middle mb-xs-12'>
                <div className='flex-grow'>
                    <div className='form-group'>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </div>
                </div>
                <div className='pl-xs-0 pl-md-20'>
                    <Checkbox
                        name='multiple'
                        label={__('Multiple')}
                        labelAlign='right'
                        value={true}
                    />
                </div>
            </div>
            <div className={cn('input-group', cx('slide'))}>
                <input
                    type='text'
                    ref={elm => op.set(refs.current, 'label', elm)}
                    placeholder={__('Label')}
                    onKeyDown={onEnterPress}
                />
                <input
                    type='text'
                    ref={elm => op.set(refs.current, 'value', elm)}
                    placeholder={__('Value')}
                    onKeyDown={onEnterPress}
                />
                <Button
                    color={Button.ENUMS.COLOR.TERTIARY}
                    onClick={onAddClick}
                    style={{ padding: 0, width: 41, height: 41 }}>
                    <Icon name='Feather.Plus' size={22} />
                </Button>
            </div>
            <ul
                className={cx('list')}
                ref={elm => op.set(refs.current, 'list', elm)}>
                {options().map((item, i) => (
                    <ListItem
                        key={`page-template-${i}`}
                        onDelete={onDelete}
                        onChange={onChange}
                        item={item}
                        index={i}
                    />
                ))}
            </ul>
        </FieldTypeDialog>
    );
};

const ListItem = props => {
    const { index, item, onChange, onDelete } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <li>
            <div className='input-group'>
                <input
                    type='text'
                    data-index={index}
                    data-key='label'
                    placeholder={__('Label')}
                    value={op.get(item, 'label')}
                    onChange={onChange}
                />
                <input
                    type='text'
                    data-index={index}
                    data-key='value'
                    placeholder={__('Value')}
                    value={op.get(item, 'value')}
                    onChange={onChange}
                />
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={() => onDelete(index)}
                    style={{ padding: 0, width: 41, height: 41 }}>
                    <Icon name='Feather.X' size={22} />
                </Button>
            </div>
        </li>
    );
};
