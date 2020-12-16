import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Toolbar from './Toolbar';
import ReactPlayer from 'react-player';
import useLocalState from '../useLocalState';
import ENUMS from 'components/Admin/Media/enums';

import Reactium, {
    __,
    useAsyncEffect,
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

import React, { forwardRef, useEffect, useRef } from 'react';

const Single = forwardRef(({ file, handle, media }, ref) => {
    const { cx, nav, remove } = handle;

    const containerRef = useRef();

    const tools = useHandle('AdminTools');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const [state, setState, getState] = useLocalState({
        item: file ? op.get(media.data, file.objectId) : null,
        cls: cn('preview', 'faded'),
    });

    const isType = (types = []) =>
        _.flatten([types])
            .map(type => String(type).toLowerCase())
            .includes(String(getState('item.type', '')).toLowerCase());

    const load = async () => {
        const { item } = state;

        if (!isStatus(ENUMS.STATUS.INIT)) return;
        if (!item) return;

        if (!isType(['image', 'audio'])) {
            setStatus(ENUMS.STATUS.LOADED);
            return;
        }

        setStatus(ENUMS.STATUS.LOADING);

        // get image info
        await new Promise(resolve => {
            if (isType('image')) {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = url();
            }

            if (isType('audio')) {
                if (getState('item.thumbnail')) {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.src = url('thumbnail');
                } else {
                    resolve();
                }
            }
        });

        setStatus(ENUMS.STATUS.LOADED, true);
    };

    const url = which => {
        switch (which) {
            case 'thumbnail':
                return Reactium.Media.url(getState('item.thumbnail'));

            default:
                return getState('item.redirect.url', getState('item.url'));
        }
    };

    const viewImage = e => {
        e.preventDefault();
        e.stopPropagation();

        const Modal = op.get(tools, 'Modal');
        Modal.show(
            <div className='lightbox' onClick={() => Modal.hide()} ref={ref}>
                <img src={url()} style={{ width: 'auto', height: 'auto' }} />
                <Button
                    appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                    className='close'
                    color={Button.ENUMS.COLOR.SECONDARY}>
                    <Icon name='Feather.X' />
                </Button>
            </div>,
        );
    };

    useAsyncEffect(load, [state.item]);

    useEffect(() => {
        if (isStatus(ENUMS.STATUS.LOADED)) {
            _.delay(() => {
                setStatus(ENUMS.STATUS.READY);
                setState(
                    'cls',
                    cn('preview', String(getState('item.type')).toLowerCase()),
                );
            }, 125);
        }
    }, [Object.values(state), status]);

    return (
        <div className={cn(cx('thumbs'), 'single')} ref={containerRef}>
            {isType('image') && (
                <div
                    className={state.cls}
                    style={{ backgroundImage: `url(${url()})` }}
                    onClick={viewImage}
                />
            )}
            {isType('video') && (
                <div className={state.cls}>
                    <ReactPlayer
                        controls
                        url={url()}
                        width='100%'
                        height='100%'
                    />
                </div>
            )}
            {isType('audio') && (
                <div
                    className={state.cls}
                    style={{
                        backgroundImage: url('thumbnail')
                            ? `url(${url('thumbnail')})`
                            : null,
                    }}>
                    <audio width='100%' height='auto' controls>
                        <source
                            src={url()}
                            type={`audio/${getState('item.ext')}`}
                        />
                        {ENUMS.TEXT.AUDIO_UNSUPPORTED}
                    </audio>
                </div>
            )}
            {isType('file') && (
                <div
                    className={state.cls}
                    style={{
                        backgroundImage: url('thumbnail')
                            ? `url(${url('thumbnail')})`
                            : null,
                    }}>
                    {!url('thumbnail') && <Icon name='Linear.FileEmpty' />}
                </div>
            )}
            <Toolbar nav={nav}>
                <span className='small ml-xs-8'>{url()}</span>
            </Toolbar>
            <Button
                appearance={Button.ENUMS.APPEARANCE.PILL}
                className='delete-btn'
                color={Button.ENUMS.COLOR.DANGER}
                onClick={() => remove(file.objectId)}
                size={Button.ENUMS.SIZE.SM}>
                {__('Remove %type').replace(
                    /\%type/gi,
                    op.get(state.item, 'type', 'File'),
                )}
            </Button>
        </div>
    );
});

export { Single, Single as default };
