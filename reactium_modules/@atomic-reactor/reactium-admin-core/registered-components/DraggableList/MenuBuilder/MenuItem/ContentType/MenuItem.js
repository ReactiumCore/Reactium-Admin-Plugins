import React, { useRef, useEffect, memo } from 'react';
import Reactium, {
    __,
    useHookComponent,
    useDerivedState,
    useAsyncEffect,
} from 'reactium-core/sdk';
import { Link } from 'react-router-dom';
import op from 'object-path';
import _ from 'underscore';

const noop = () => {};

const areEqual = (pv, nx) => {
    return op.get(pv, 'item.id') === op.get(nx, 'item.id');
};

const ContentTypeMenuItem = memo(props => {
    const dialogRef = useRef();
    const iconPickerRef = useRef();
    const { Button, Dialog, Icon } = useHookComponent('ReactiumUI');
    const DragHandle = useHookComponent('MenuItemDragHandle');
    const IconSelect = useHookComponent('IconSelect');
    const fieldName = op.get(props, 'fieldName');
    const [menuItem, setMenuItem] = useDerivedState(op.get(props, 'item', {}), [
        'id',
        'item.objectId',
    ]);
    const item = op.get(menuItem, 'item', {});

    const title = op.get(
        item,
        'title',
        op.get(item, 'context.title', op.get(item, 'context.slug')),
    );
    const onRemoveItem = op.get(props, 'onRemoveItem', noop);
    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();

    const icon = op.get(
        item,
        'icon',
        op.get(item, 'context.type.meta.icon', 'Linear.Papers'),
    );
    const typeSlug = op.get(item, 'context.type.machineName');
    const slug = op.get(item, 'context.slug');

    const onChange = type => e => {
        setMenuItem({ [type]: e.target.value });
    };

    const toggleIconPicker = () => {
        if (dialogRef.current && iconPickerRef.current) {
            iconPickerRef.current.toggle();

            // about to show
            if (!iconPickerRef.visible) _.defer(dialogRef.current.expand);
        }
    };

    useEffect(() => {
        if (!op.has(item, 'icon')) {
            setMenuItem({ ['item.icon']: icon });
        }
    }, [op.get(item.id)]);

    useEffect(() => {
        if (dialogRef.current) {
            _.defer(dialogRef.current.collapse);
        }
    }, [menuItem.id]);

    useAsyncEffect(async isMounted => {
        const menuItemSave = Reactium.Hook.register(
            'menu-build-item-save',
            async (fn, saving) => {
                if (fn === fieldName && saving.id === menuItem.id) {
                    const freshItem = await Reactium.Content.retrieve({
                        type: {
                            machineName: op.get(
                                saving.item,
                                'context.type.machineName',
                            ),
                        },
                        uuid: op.get(saving.item, 'context.uuid'),
                        current: true,
                        resolveRelations: true,
                    });

                    // trim objectIds to discourage migration unsafe coding downstream
                    op.del(freshItem, 'type.objectId');
                    op.del(freshItem, 'objectId');

                    if (!isMounted()) return;

                    Object.entries(menuItem).forEach(([key, value]) => {
                        if (key === 'item')
                            value = {
                                ...op.get(saving, 'item', {}),
                                icon: op.get(
                                    saving,
                                    'item.icon',
                                    op.get(
                                        freshItem,
                                        'type.meta.icon',
                                        'Linear.Papers',
                                    ),
                                ),
                                title: op.get(
                                    saving,
                                    'item.title',
                                    op.get(freshItem, 'title', ''),
                                ),
                                url: op.get(
                                    freshItem,
                                    'urls.0.route',
                                    `/${op.get(
                                        freshItem,
                                        'type.machineName',
                                    )}/${op.get(freshItem, 'slug')}`,
                                ),
                                // fly-weight context
                                context: {
                                    uuid: op.get(freshItem, 'uuid'),
                                    slug: op.get(freshItem, 'slug'),
                                    title: op.get(freshItem, 'title'),
                                    meta: op.get(freshItem, 'meta', {}),
                                    type: {
                                        uuid: op.get(freshItem, 'type.uuid'),
                                        machineName: op.get(
                                            freshItem,
                                            'type.machineName',
                                        ),
                                        namespace: op.get(
                                            freshItem,
                                            'type.namespace',
                                        ),
                                        meta: op.get(
                                            freshItem,
                                            'type.meta',
                                            {},
                                        ),
                                    },
                                    ...(op.has(freshItem, 'urls')
                                        ? { urls: op.get(freshItem, 'urls') }
                                        : {}),
                                },
                            };

                        op.set(saving, key, value);
                    });
                }
            },
        );

        return () => Reactium.Hook.unregister(menuItemSave);
    });

    return (
        <Dialog
            className={'menu-item menu-item-content-type'}
            header={{
                title: typeSlug ? (
                    <div className='menu-item-editor-title'>
                        {icon && (
                            <Button
                                className='ar-dialog-header-btn'
                                color={Button.ENUMS.COLOR.CLEAR}
                                style={{ padding: 0, border: 'none' }}
                                onClick={toggleIconPicker}>
                                <Icon name={icon} />
                            </Button>
                        )}
                        <Link
                            to={`/admin/content/${typeSlug}/${slug}`}
                            target={'__blank'}>
                            {title}
                        </Link>
                    </div>
                ) : (
                    title
                ),
                elements: [
                    <DragHandle key='dh' bind={op.get(props, 'bind')} />,
                ],
            }}
            pref={`menu-item-${menuItem.id}`}
            ref={dialogRef}
            dismissable={true}
            onDismiss={onRemoveItem(menuItem)}
            onCollapse={() => _.defer(animateResize)}
            onExpand={() => _.defer(animateResize)}>
            <div className={'p-xs-20'}>
                <IconSelect
                    ref={iconPickerRef}
                    value={icon}
                    onChange={onChange('item.icon')}
                />
                <div className='form-group'>
                    <label>
                        <span>{__('Label')}</span>
                        <input
                            type='text'
                            value={title}
                            onChange={onChange('item.title')}
                        />
                    </label>
                </div>
            </div>
        </Dialog>
    );
}, areEqual);

export default ContentTypeMenuItem;
