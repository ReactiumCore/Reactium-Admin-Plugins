import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../../enums';

import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useIsContainer,
    useStatus,
    Zone,
} from 'reactium-core/sdk';
import { Button, Collapsible, Icon } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

export const ListItem = forwardRef(({ list, ...props }, ref) => {
    const containerRef = useRef();
    const collapsibleRef = useRef();
    const deleteBtn = useRef();

    const { slug } = props;
    const { state = {}, cx, id } = list;
    const { columns, type } = state;

    const url = `/admin/content/${type}/${slug}`;

    const ListColumn = useHookComponent(`${id}Column`);

    const [confirm, setConfirm] = useState(false);

    const [expanded, setExpanded] = useState(false);

    const isContainer = useIsContainer();

    const deleteCancel = e => {
        if (!deleteBtn.current) return;

        if (e.type === 'mouseleave') {
            if (isContainer(e.currentTarget, containerRef.current)) {
                setConfirm(false);
            }
        } else {
            if (isContainer(e.target, containerRef.current)) return;
        }
        deleteBtn.current.blur();
        setConfirm(false);
    };

    const deleteConfirm = e => {
        e.target.blur();
        list.deleteContent(props.objectId);
    };

    const deleteConfirmToggle = () => {
        setConfirm(!confirm);
        handle.collapse();
    };

    const onCollapse = () => {
        setExpanded(false);
        handle.dispatchEvent(new Event('collapse'));
    };

    const onExpand = () => {
        setExpanded(true);
        setConfirm(false);
        handle.dispatchEvent(new Event('expand'));
    };

    const _handle = () => {
        const output = {
            deleteCancel,
            deleteConfirm,
            deleteConfirmToggle,
        };

        if (collapsibleRef.current) {
            const { collapse, expand, toggle } = collapsibleRef.current;
            op.set(output, 'collapse', collapse);
            op.set(output, 'expand', expand);
            op.set(output, 'toggle', toggle);
        }

        if (containerRef.current) {
            op.set(output, 'container', containerRef.current);
        }

        return output;
    };

    const [handle, setHandle] = useEventHandle(_handle());

    useEffect(() => {
        if (!collapsibleRef.current) return;

        const newHandle = _handle();
        if (_.isEqual(handle, newHandle)) return;
        setHandle(newHandle);
    }, [collapsibleRef.current, containerRef.current, confirm, expanded]);

    useEffect(() => {
        if (!containerRef.current || typeof window === 'undefined') return;
        window.addEventListener('mousedown', deleteCancel);
        window.addEventListener('touchstart', deleteCancel);

        return () => {
            window.removeEventListener('mousedown', deleteCancel);
            window.removeEventListener('touchstart', deleteCancel);
        };
    }, [containerRef.current]);

    useImperativeHandle(ref, () => handle);

    return !columns ? null : (
        <div
            ref={containerRef}
            onMouseLeave={e => deleteCancel(e)}
            className={cx('item-container')}
            data-id={`item-${props.objectId}`}>
            <div className={cx('item')}>
                <div className={cn(cx('item-delete'), { confirm })}>
                    <Button
                        color={Button.ENUMS.COLOR.DANGER}
                        ref={deleteBtn}
                        type='button'
                        onClick={deleteConfirm}>
                        {__('Delete')}
                    </Button>
                </div>
                <div className={cn(cx('item-columns'), { confirm })}>
                    {columns.map(column => (
                        <ListColumn
                            key={column.id}
                            url={url}
                            column={column}
                            list={list}
                            row={handle}
                            {...props}
                        />
                    ))}
                </div>
            </div>
            <Collapsible
                ref={collapsibleRef}
                expanded={expanded}
                onCollapse={onCollapse}
                onExpand={onExpand}>
                <QuickEditor {...props} list={list} row={handle} />
            </Collapsible>
        </div>
    );
});

const QuickEditor = ({ list, row, ...props }) => {
    const contentType = op.get(list, 'state.contentType');
    if (!contentType) return null;

    const cx = op.get(list, 'cx');
    const type = op.get(list, 'state.type');

    const components = _.pluck(
        Reactium.Content.QuickEditor.list.filter(
            ({ contentTypes }) => !contentTypes || contentTypes.includes(type),
        ),
        'component',
    );

    const componentProps = {
        list,
        row,
        item: props,
    };

    return (
        <div className={cx('item-quick-editor')}>
            <div>
                {components.map((Component, id) => (
                    <Component key={`quick-editor-${id}`} {...componentProps} />
                ))}
                <Zone zone={cx('item-quick-editor')} {...componentProps} />
                <Zone
                    zone={cx(`item-quick-editor-${type}`)}
                    {...componentProps}
                />
            </div>
        </div>
    );
};

export const ListColumn = ({ column, list, row, ...props }) => {
    const { className, zones } = column;
    const item = JSON.parse(JSON.stringify(props));

    op.del(item, 'column');
    op.del(item, 'order');
    op.del(item, 'zone');
    op.del(item, 'url');
    op.del(item, 'id');

    return (
        <div className={className}>
            {zones.map(zone => (
                <Zone
                    key={zone}
                    zone={zone}
                    list={list}
                    row={row}
                    column={column}
                    item={item}
                    {...props}
                />
            ))}
        </div>
    );
};

export const ListItemActions = ({ item, list, row }) => {
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        size: Button.ENUMS.SIZE.XS,
        style: { padding: 0, width: 50 },
        type: 'button',
    };

    const clone = async () => {
        if (!isStatus(ENUMS.STATUS.PENDING)) return;

        setStatus(ENUMS.STATUS.BUSY, true);

        await list.clone(item.objectId);

        setStatus(ENUMS.STATUS.COMPLETE, true);
    };

    const cloneTooltip = () => ({
        title: String(__('Copy: %title')).replace(/\%title/gi, item.title),
    });

    useEffect(() => {
        switch (status) {
            case ENUMS.STATUS.COMPLETE:
                setTimeout(() => setStatus(ENUMS.STATUS.PENDING, true), 2000);
                break;
        }
    }, [status]);

    return (
        <>
            <Button {...buttonProps} onClick={() => row.deleteConfirmToggle()}>
                <span className='red'>
                    <Icon name='Feather.Trash2' />
                </span>
            </Button>
            {item.status !== 'TRASH' && (
                <Button
                    {...buttonProps}
                    onClick={() => clone()}
                    {...cloneTooltip()}
                    disabled={isStatus(ENUMS.STATUS.BUSY)}>
                    {isStatus(ENUMS.STATUS.PENDING) && (
                        <span>
                            <Icon name='Feather.Copy' />
                        </span>
                    )}
                    {isStatus(ENUMS.STATUS.BUSY) && (
                        <span className='red'>
                            <Icon name='Feather.Activity' />
                        </span>
                    )}
                    {isStatus(ENUMS.STATUS.COMPLETE) && (
                        <span className='blue'>
                            <Icon name='Feather.Check' />
                        </span>
                    )}
                </Button>
            )}
            <Button {...buttonProps} onClick={() => row.toggle()}>
                <span>
                    <Icon name='Feather.MoreVertical' />
                </span>
            </Button>
        </>
    );
};

export const ListItemStatus = ({ list, status }) => (
    <Button
        appearance={Button.ENUMS.APPEARANCE.PILL}
        block
        color={statusToColor(status)}
        onClick={e => {
            e.currentTarget.blur();
            if (op.get(list, 'state.filter') === status) return;
            list.setState({ filter: status });
        }}
        outline
        readOnly={op.get(list, 'state.status') === status}
        size={Button.ENUMS.SIZE.XS}
        type={Button.ENUMS.TYPE.BUTTON}>
        {status}
    </Button>
);

export const ListItemTitle = ({ slug, title, url }) => (
    <div
        onClick={() => Reactium.Routing.history.push(url)}
        className='flex middle'
        style={{
            flexGrow: 1,
            textDecoration: 'none',
            height: '100%',
            marginLeft: -20,
            paddingLeft: 20,
        }}>
        <div>
            <div className='title'>{title}</div>
            <div className='slug'>{slug}</div>
        </div>
    </div>
);

export const statusToColor = status => {
    const COLOR = Button.ENUMS.COLOR;

    const def = COLOR.INFO;

    const map = {
        PUBLISHED: COLOR.SUCCESS,
        TRASH: COLOR.DANGER,
        DRAFT: COLOR.TERTIARY,
    };

    return op.get(map, String(status).toUpperCase(), def);
};
