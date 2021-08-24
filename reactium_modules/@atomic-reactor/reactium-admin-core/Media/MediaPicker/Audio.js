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
        objectId,
        thumbnail,
        type,
        style = {},
        className = 'block',
        cx,
        onItemSelect,
        onItemUnselect,
        selected = false,
    } = props;

    const cont = useRef();

    const thm = thumbnail ? Reactium.Media.url(thumbnail) : null;

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
            if (thm) {
                const img = new Image();
                img.onload = resolve(img);
                img.src = thm;
            } else {
                resolve();
            }
        });

        if (unMounted()) return;

        setStatus(STATUS.LOADED, true);
    };

    const unMounted = () => !cont.current;

    useAsyncEffect(load, [status]);

    useEffect(() => {
        if (isStatus(STATUS.LOADED)) {
            setStyles({
                ...style,
                backgroundImage: thm ? `url('${thm}')` : null,
            });
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
            {!thm && (
                <span className='icon'>
                    <Icon name='Linear.Mic' />
                </span>
            )}
            {filename && <div className='label'>{filename}</div>}
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
