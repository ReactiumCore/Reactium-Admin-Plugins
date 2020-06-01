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
    const { Dialog, Icon } = useHookComponent('ReactiumUI');
    const DragHandle = useHookComponent('MenuItemDragHandle');
    const fieldName = op.get(props, 'fieldName');
    const [menuItem, setMenuItem] = useDerivedState(op.get(props, 'item', {}), [
        'id',
        'item.objectId',
    ]);
    const item = op.get(menuItem, 'item', {});
    let title = op.get(menuItem, 'label', '');
    if (!title || title.length < 1)
        title = op.get(item, 'title', op.get(item, 'slug'));

    const onRemoveItem = op.get(props, 'onRemoveItem', noop);
    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();

    const icon = op.get(item, 'type.meta.icon');
    const typeSlug = op.get(item, 'type.machineName');
    const slug = op.get(item, 'slug');

    const onChange = type => e => {
        setMenuItem({ [type]: e.target.value });
    };

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
                    const freshItem = await Reactium.Content.retrieve(
                        saving.item,
                    );
                    op.set(freshItem, 'type', op.get(saving, 'item.type'));
                    if (!isMounted()) return;

                    Object.entries(menuItem).forEach(([key, value]) => {
                        if (key === 'item') value = freshItem;
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
                        {icon && <Icon name={icon} />}
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
            onCollapse={() => {
                _.defer(animateResize);
            }}
            onExpand={() => {
                _.defer(animateResize);
            }}>
            <div className={'p-xs-20'}>
                <div className='form-group'>
                    <label>
                        <span>{__('Label')}</span>
                        <input
                            type='text'
                            value={op.get(menuItem, 'label', '')}
                            onChange={onChange('label')}
                        />
                    </label>
                </div>
            </div>
        </Dialog>
    );
}, areEqual);

export default ContentTypeMenuItem;
