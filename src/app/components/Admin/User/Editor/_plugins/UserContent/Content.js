import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import pluralize from 'pluralize';
import { Link } from 'react-router-dom';
import { statusToColor } from 'components/Admin/Content/List/ListItem';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useEventHandle,
    useWindowSize,
} from 'reactium-core/sdk';

import {
    Button,
    Carousel,
    Collapsible,
    Icon,
    Slide,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const Content = ({ editor, data }) => {
    const refs = useRef({});

    const { cx } = editor;

    const activeSlide = useRef(0);

    const carouselRef = useRef();

    const { breakpoint } = useWindowSize();

    const getChunkSize = () => {
        switch (breakpoint) {
            case 'xs':
                return 1;

            case 'sm':
                return 2;

            case 'md':
                return 3;

            case 'xl':
                return 5;

            default:
                return 4;
        }
    };

    const [chunkSize, setChunkSize] = useState(getChunkSize());

    const [expanded, setNewExpanded] = useState({});

    const [types, setTypes] = useState();

    const [updated, update] = useState(Date.now());

    const getTypes = () => Reactium.ContentType.types();

    const isExpanded = group => {
        if (op.get(expanded, group)) {
            return op.get(expanded, group);
        } else {
            return Reactium.Prefs.get(`admin.user.content.${group}`, true);
        }
    };

    const getCount = contentType => {
        if (contentType) {
            return Object.values(op.get(data, [contentType], {})).length;
        }

        const count = {};

        Object.entries(data).forEach(([key, value]) => {
            const type = op.get(types, key);
            if (!type) return;
            count[key] = Object.values(value).length;
        });

        return count;
    };

    const onCollapse = (e, group) => {
        Reactium.Prefs.set(`admin.user.content.${group}`, false);
        setExpanded({ [group]: false });
    };

    const onExpand = (e, group) => {
        Reactium.Prefs.set(`admin.user.content.${group}`, true);
        setExpanded({ [group]: true });
    };

    const setExpanded = newExpanded => {
        const exp = JSON.parse(JSON.stringify(expanded));
        Object.entries(newExpanded).forEach(([key, value]) =>
            op.set(exp, key, value),
        );

        setNewExpanded(exp);
    };

    const stats = () => {
        let list = Object.values(types).map(type => {
            type = JSON.parse(JSON.stringify(type));
            op.set(type, 'count', getCount(type.objectId));
            return type;
        });

        list = _.sortBy(list, 'label');
        list = _.sortBy(list, 'count');

        list.reverse();

        return _.chunk(list, chunkSize);
    };

    const toggleGroup = (e, group) => {
        const ref = op.get(refs.current, group);
        if (!ref) return;
        ref.toggle();
        update(Date.now());
    };

    const _handle = () => ({
        Carousel: carouselRef.current,
        isExpanded,
        toggleGroup,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useEffect(() => {
        const cs = getChunkSize();
        if (chunkSize !== cs) {
            carouselRef.current.jumpTo(0, false);
            setChunkSize(cs);
            _.defer(() => setChunkSize(cs));
        }
    });

    useEffect(() => {
        const exp = JSON.parse(JSON.stringify(expanded));
        Object.entries(refs.current).forEach(([key, ref]) =>
            op.set(exp, key, ref.state.expanded),
        );

        if (!_.isEqual(expanded, exp)) setExpanded(exp);
    }, [Object.keys(refs.current)]);

    // Update handle
    useEffect(() => {
        const newHandle = _handle();
        if (!_.isEqual(newHandle, handle)) setHandle(newHandle);
    }, [carouselRef.current]);

    useAsyncEffect(async mounted => {
        if (!types) {
            const response = await getTypes();
            if (mounted()) {
                setTypes(
                    _.chain(
                        response.map(item => {
                            const { icon, label } = op.get(item, 'meta');

                            if (!icon || !label) return null;

                            const objectId = op.get(item, 'objectId');
                            const type = op.get(item, 'type');
                            const group = pluralize(type);
                            const addURL = `/admin/content/${type}/new`;
                            const listURL = `/admin/content/${group}/page/1`;

                            return {
                                group,
                                icon,
                                label,
                                objectId,
                                addURL,
                                listURL,
                            };
                        }),
                    )
                        .compact()
                        .indexBy('objectId')
                        .value(),
                );
            }
        }
        return () => {};
    });

    const render = () => (
        <>
            {types && (
                <div className={cx('content-stats')}>
                    <Carousel ref={carouselRef} loop>
                        {stats().map((chunk, i) => (
                            <Slide key={`slide-${i}`}>
                                <div>
                                    {chunk.map((item, k) => (
                                        <Stat
                                            key={`stat-${k}`}
                                            {...item}
                                            cx={cx}
                                        />
                                    ))}
                                </div>
                            </Slide>
                        ))}
                    </Carousel>
                    <Button
                        className='nav nav-left'
                        color={Button.ENUMS.COLOR.CLEAR}
                        onClick={() => carouselRef.current.prev()}
                        size={Button.ENUMS.SIZE.MD}>
                        <Icon name='Feather.ChevronLeft' />
                    </Button>
                    <Button
                        className='nav nav-right'
                        color={Button.ENUMS.COLOR.CLEAR}
                        onClick={() => carouselRef.current.next()}
                        size={Button.ENUMS.SIZE.MD}>
                        <Icon name='Feather.ChevronRight' />
                    </Button>
                </div>
            )}
            {types && (
                <div className={cx('content-list')}>
                    {Object.entries(data).map(([key, value]) => {
                        const type = op.get(types, key);
                        if (!type) return null;

                        const { group } = type;
                        const items = Object.values(value);

                        return (
                            <div key={key} className={cx('content-list-group')}>
                                <ListHeading
                                    editor={editor}
                                    type={type}
                                    {..._handle()}
                                />
                                <Collapsible
                                    expanded={isExpanded(group)}
                                    onCollapse={e => onCollapse(e, group)}
                                    onExpand={e => onExpand(e, group)}
                                    ref={elm => {
                                        if (elm)
                                            op.set(refs.current, group, elm);
                                    }}>
                                    {items.map(item => (
                                        <ListItem
                                            {...item}
                                            key={`ugc-${item.typeID}-${item.contentID}`}
                                        />
                                    ))}
                                </Collapsible>
                            </div>
                        );
                    })}
                </div>
            )}
            {!types && <Spinner className={cx('spinner')} />}
        </>
    );

    return render();
};

const ListHeading = ({ editor, type, ...props }) => (
    <button
        onClick={e => props.toggleGroup(e, type.group)}
        className={cn({
            [editor.cx('content-list-heading')]: true,
            collapsed: !props.isExpanded(type.group),
        })}>
        <div className='icon'>
            <Icon className='mr-xs-8' name={type.icon} size={22} />
        </div>
        <span className='flex-grow'>{type.group}</span>
        <Icon
            className='mr-xs-8'
            size={20}
            name={
                props.isExpanded(type.group)
                    ? 'Feather.ChevronUp'
                    : 'Feather.ChevronDown'
            }
        />
    </button>
);

const ListItem = props => {
    const cx = Reactium.Utils.cxFactory('admin-content-list');

    const columnClassName = field =>
        cn(
            cx('column'),
            cx(`column-${field}`),
            cx(`column-${field}-${props.type}`),
            cx(`column-${props.type}`),
        );

    const render = () => {
        return (
            <div className={cx('item-container')}>
                <div className={cx('item')}>
                    <div className={cx('item-columns')}>
                        <div className={columnClassName('title')}>
                            <div className='flex-middle'>
                                <div>
                                    <div className='title'>{props.title}</div>
                                    <div className='slug'>/{props.slug}</div>
                                </div>
                            </div>
                        </div>
                        <div className={columnClassName('status')}>
                            <Button
                                appearance={Button.ENUMS.APPEARANCE.PILL}
                                block
                                color={statusToColor(props.status)}
                                outline
                                readOnly={true}
                                size={Button.ENUMS.SIZE.XS}
                                type={Button.ENUMS.TYPE.BUTTON}>
                                {props.status}
                            </Button>
                        </div>
                        <div className={columnClassName('actions')}>
                            <Button
                                to={props.url}
                                color={Button.ENUMS.COLOR.CLEAR}
                                type={Button.ENUMS.TYPE.LINK}>
                                <Icon name='Feather.Edit2' />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return render();
};

const Stat = ({ cx, ...props }) => {
    const { count = 0, group, icon, addURL, listURL } = props;
    return (
        <Link to={listURL} className={cx('content-stat')}>
            <div className={cx('content-stat-label')}>
                <span className='flex-grow'>{group}</span>
                <span className={cx('content-stat-icon')}>
                    <Icon name={icon} />
                </span>
            </div>
            <div className={cx('content-stat-count')}>
                {Reactium.Utils.abbreviatedNumber(count)}
            </div>
        </Link>
    );
};

export { Content, Content as default };
