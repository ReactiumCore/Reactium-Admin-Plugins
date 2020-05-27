import _ from 'underscore';
import uuid from 'uuid/v4';
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
        templates: [],
    });

    const { DragHandle } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('template-cte');

    const onAddClick = () => {
        const name = op.get(refs.current, 'name').value;
        let { templates = [] } = state;

        templates = _.flatten([templates]);
        templates.push(name);
        templates = _.uniq(templates);

        refs.current.name.value = '';
        refs.current.name.focus();

        setState({ templates });
    };

    const onChange = e => {
        let { templates } = state;
        const { value } = e.currentTarget;
        const { index } = e.currentTarget.dataset;
        op.set(templates, index, value);
        setState({ templates });
    };

    const onDelete = template => {
        let { templates = [] } = state;
        templates = _.without(templates, template);
        setState({ templates });
    };

    const onEnterPress = e => {
        if (e.which === 13) {
            e.preventDefault();
            onAddClick();
        }
    };

    const onLoad = () => {
        const hookId = Reactium.Hook.register(
            `field-type-form-change-${id}`,
            async e => {
                if (e.value) {
                    const templates = op
                        .get(e.value, 'templates', '')
                        .split(',');
                    if (_.isEqual(templates, state.templates)) return;
                    setState({ templates });
                }
            },
        );

        return () => {
            Reactium.Hook.unregister(hookId);
        };
    };

    useEffect(onLoad);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <div className='input-group'>
                <input
                    type='text'
                    ref={elm => op.set(refs.current, 'name', elm)}
                    placeholder='Template Name'
                    onKeyDown={onEnterPress}
                />
                <input
                    type='hidden'
                    value={state.templates.join(',')}
                    name='templates'
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
                {state.templates.map((item, i) => (
                    <ListItem
                        key={`page-template-${i}`}
                        onDelete={onDelete}
                        onChange={onChange}
                        template={item}
                        index={i}
                    />
                ))}
            </ul>
        </FieldTypeDialog>
    );
};

const ListItem = props => {
    const { index, template, onChange, onDelete } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <li>
            <div className='input-group'>
                <input
                    type='text'
                    data-index={index}
                    placeholder={__('Template Name')}
                    value={template}
                    onChange={onChange}
                />
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={() => onDelete(template)}
                    style={{ padding: 0, width: 41, height: 41 }}>
                    <Icon name='Feather.X' size={22} />
                </Button>
            </div>
        </li>
    );
};
