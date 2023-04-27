import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, {
    useAsyncEffect,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const STATUS = {
    INIT: 'INIT',
    LOADING: 'LOADING',
    LOADED: 'LOADED',
    READY: 'READY',
};

export default props => {
    const {
        filename,
        meta = {},
        objectId,
        thumbnail,
        type,
        url,
        style = {},
        className = 'block',
        cx,
        onItemSelect,
        onItemUnselect,
        redirect = {},
        selected = false,
    } = props;

    const cont = useRef();

    const thm = thumbnail
        ? Reactium.Media.url(thumbnail)
        : op.get(redirect, 'url', url);

    const title = op.get(meta, 'title', filename);

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(STATUS.INIT);

    const [styles, setStyles] = useState({ ...style });

    const onClick = selected ? onItemUnselect : onItemSelect;

    const cls = cn(className, cx('item'), String(type).toLowerCase(), {
        selected,
        faded: !isStatus(STATUS.READY),
    });

    const color = selected ? 'danger' : 'primary';
    const ico = selected ? 'Feather.X' : 'Feather.Check';

    const load = async () => {
        if (!isStatus(STATUS.INIT)) return;

        setStatus(STATUS.LOADING);

        await new Promise(resolve => {
            const img = new Image();
            img.onload = resolve(img);
            img.src = thm;
        });

        if (unMounted()) return;

        setStatus(STATUS.LOADED, true);
    };

    const unMounted = () => !cont.current;

    useAsyncEffect(load, [status]);

    useEffect(() => {
        if (isStatus(STATUS.LOADED)) {
            setStyles({ ...style, backgroundImage: `url('${thm}')` });
            setStatus(STATUS.READY, true);
            return;
        }
    }, [status]);

    return (
        <div
            className={cls}
            onClick={() => onClick(objectId)}
            ref={cont}
            style={styles}>
            {title && <div className='title'>{title}</div>}
            <Button
                appearance='circle'
                className='check'
                color={color}
                readOnly>
                <Icon name={ico} />
            </Button>
        </div>
    );
};
