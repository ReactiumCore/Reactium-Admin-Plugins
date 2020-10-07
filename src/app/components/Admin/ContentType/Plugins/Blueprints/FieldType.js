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
        previewURL: null,
        blueprints: [],
    });

    const { DragHandle } = props;
    const { Button, Carousel, Icon, Slide } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('blueprint-cte');

    const onAddClick = () => {
        const name = op.get(refs.current, 'name').value;
        let { blueprints = [] } = state;

        blueprints = _.flatten([blueprints]);
        blueprints.push(name);
        blueprints = _.uniq(blueprints);

        refs.current.name.value = '';
        refs.current.name.focus();

        setState({ blueprints });
    };

    const onChange = e => {
        let { blueprints } = state;
        const { value } = e.currentTarget;
        const { index } = e.currentTarget.dataset;
        op.set(blueprints, index, value);
        setState({ blueprints });
    };

    const onDelete = blueprint => {
        let { blueprints = [] } = state;
        blueprints = _.without(blueprints, blueprint);
        setState({ blueprints });
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
                    const blueprints = String(
                        op.get(e.value, 'blueprints') || '',
                    ).split(',');

                    const previewURL = op.get(e.value, 'previewURL');

                    if (_.isEqual(blueprints, state.blueprints)) return;
                    setState({ previewURL, blueprints });
                }
            },
        );

        return () => {
            Reactium.Hook.unregister(hookId);
        };
    };

    const previewChange = e => setState({ previewURL: e.target.value });

    const blueprints = () => {
        let blueprints = op.get(state, 'blueprints');
        blueprints = _.compact(blueprints);

        Reactium.Hook.runSync('blueprint-list', blueprints, props);
        return blueprints;
    };

    useEffect(onLoad);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <input
                type='hidden'
                value={blueprints().join(',')}
                name='blueprints'
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
                            placeholder='Blueprint Name'
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
                {blueprints().map((item, i) => (
                    <ListItem
                        key={`page-blueprint-${i}`}
                        onDelete={onDelete}
                        onChange={onChange}
                        blueprint={item}
                        index={i}
                    />
                ))}
            </ul>
        </FieldTypeDialog>
    );
};

const ListItem = props => {
    const { index, blueprint, onChange, onDelete } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <li>
            <div className='input-group'>
                <input
                    type='text'
                    data-index={index}
                    placeholder={__('Blueprint Name')}
                    value={blueprint}
                    onChange={onChange}
                />
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={() => onDelete(blueprint)}
                    style={{ padding: 0, width: 41, height: 41 }}>
                    <Icon name='Feather.X' size={22} />
                </Button>
            </div>
        </li>
    );
};
