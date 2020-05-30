import React, { useRef, useEffect, memo } from 'react';
import Reactium, {
    __,
    useHookComponent,
    useDerivedState,
    useAsyncEffect,
} from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';

const noop = () => {};

const areEqual = (pv, nx) => {
    return op.get(pv, 'item.id') === op.get(nx, 'item.id');
};

const LinkMenuItem = memo(props => {
    const dialogRef = useRef();
    const { Dialog, Icon } = useHookComponent('ReactiumUI');
    const DragHandle = useHookComponent('MenuItemDragHandle');

    const fieldName = op.get(props, 'fieldName');
    const [menuItem, setMenuItem] = useDerivedState(op.get(props, 'item', {}), [
        'id',
        'item.title',
        'item.url',
    ]);

    const item = op.get(menuItem, 'item', {});
    const title = op.get(item, 'title');
    const url = op.get(item, 'url');

    const onRemoveItem = op.get(props, 'onRemoveItem', noop);

    const onChange = type => e => {
        const updatedItem = {
            ...item,
            [type]: e.target.value,
        };

        setMenuItem({ item: updatedItem });
    };

    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();

    useEffect(() => {
        if (dialogRef.current) {
            _.defer(dialogRef.current.collapse);
        }
    }, [menuItem.id]);

    useAsyncEffect(async isMounted => {
        const menuItemSave = Reactium.Hook.register(
            'menu-build-item-save',
            async (fn, saving) => {
                if (
                    fn === fieldName &&
                    saving.id === menuItem.id &&
                    isMounted()
                ) {
                    op.set(saving, 'item', item);
                }
            },
        );

        return () => Reactium.Hook.unregister(menuItemSave);
    });

    return (
        <Dialog
            className={'menu-item menu-item-content-type'}
            header={{
                title: (
                    <div className='menu-item-editor-title'>
                        <Icon name={'Feather.Link'} />
                        <span>{title}</span>
                    </div>
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
                        <span>{__('Title')}</span>
                        <input
                            type='text'
                            value={title}
                            onChange={onChange('title')}
                        />
                    </label>
                </div>
                <div className='form-group'>
                    <label>
                        <span>{__('URL')}</span>
                        <input
                            type='text'
                            value={url}
                            onChange={onChange('url')}
                        />
                    </label>
                </div>
            </div>
        </Dialog>
    );
}, areEqual);

export default LinkMenuItem;
