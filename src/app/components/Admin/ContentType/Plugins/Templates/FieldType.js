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
        previewURL: null,
        templates: [],
    });

    const { DragHandle } = props;
    const { Button, Carousel, Icon, Slide } = useHookComponent('ReactiumUI');
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
                    const templates = String(
                        op.get(e.value, 'templates') || '',
                    ).split(',');

                    const previewURL = op.get(e.value, 'previewURL');

                    if (_.isEqual(templates, state.templates)) return;
                    setState({ previewURL, templates });
                }
            },
        );

        return () => {
            Reactium.Hook.unregister(hookId);
        };
    };

    const previewChange = e => setState({ previewURL: e.target.value });

    const templates = () => {
        let templates = op.get(state, 'templates');
        templates = _.compact(templates);

        Reactium.Hook.runSync('template-list', templates, props);
        return templates;
    };

    useEffect(onLoad);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <input
                type='hidden'
                value={templates().join(',')}
                name='templates'
            />
            <input
                type='hidden'
                value={state.previewURL || ''}
                name='previewURL'
            />
            <Carousel
                animationSpeed={0.25}
                className={cx('carousel')}
                ref={elm => op.set(refs.current, 'carousel', elm)}>
                <Slide>
                    <div className={cn('input-group', cx('slide'))}>
                        <input
                            type='text'
                            ref={elm => op.set(refs.current, 'name', elm)}
                            placeholder='Template Name'
                            onKeyDown={onEnterPress}
                        />

                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={onAddClick}
                            style={{ padding: 0, width: 41, height: 41 }}>
                            <Icon name='Feather.Plus' size={22} />
                        </Button>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={() => refs.current.carousel.next()}
                            style={{ padding: 0, width: 41, height: 41 }}>
                            <Icon name='Feather.Settings' size={18} />
                        </Button>
                    </div>
                </Slide>
                <Slide>
                    <div className='input-group'>
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={() => refs.current.carousel.prev()}
                            style={{ padding: 0, width: 41, height: 41 }}>
                            <Icon name='Feather.Check' size={22} />
                        </Button>
                        <input
                            type='text'
                            placeholder={`${__(
                                'Preview URL:',
                            )} https://yoursite.com/api/preview/:type/:branch/:revision`}
                            value={state.previewURL || ''}
                            onFocus={e => e.target.select()}
                            onChange={previewChange}
                        />
                    </div>
                </Slide>
            </Carousel>
            <ul
                className={cx('list')}
                ref={elm => op.set(refs.current, 'list', elm)}>
                {templates().map((item, i) => (
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
