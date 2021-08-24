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
    const iconPickerRef = useRef();
    const { Button, Dialog, Icon } = useHookComponent('ReactiumUI');
    const DragHandle = useHookComponent('MenuItemDragHandle');
    const IconSelect = useHookComponent('IconSelect');
    const fieldName = op.get(props, 'fieldName');
    const [menuItem, setMenuItem] = useDerivedState(op.get(props, 'item', {}), [
        'id',
        'item.title',
        'item.url',
        'item.icon',
    ]);

    const item = op.get(menuItem, 'item', {});
    const title = op.get(item, 'title');
    const url = op.get(item, 'url');
    const icon = op.get(item, 'icon', 'Feather.Link');

    const onRemoveItem = op.get(props, 'onRemoveItem', noop);

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

    const animateResize = () =>
        op.get(props.listRef.current, 'animateResize', noop)();

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

    useEffect(() => {
        const menuItemSave = Reactium.Hook.registerSync(
            'menu-build-item-save',
            (fn, saving) => {
                if (fn === fieldName && saving.id === menuItem.id) {
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
                        <Button
                            className='ar-dialog-header-btn'
                            color={Button.ENUMS.COLOR.CLEAR}
                            style={{ padding: 0, border: 'none' }}
                            onClick={toggleIconPicker}>
                            <Icon name={icon} />
                        </Button>
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
                <IconSelect
                    ref={iconPickerRef}
                    value={icon}
                    onChange={onChange('item.icon')}
                />
                <div className='form-group'>
                    <label>
                        <span>{__('Title')}</span>
                        <input
                            type='text'
                            value={title}
                            onChange={onChange('item.title')}
                        />
                    </label>
                </div>
                <div className='form-group'>
                    <label>
                        <span>{__('URL')}</span>
                        <input
                            type='text'
                            value={url}
                            onChange={onChange('item.url')}
                        />
                    </label>
                </div>
            </div>
        </Dialog>
    );
}, areEqual);

export default LinkMenuItem;
