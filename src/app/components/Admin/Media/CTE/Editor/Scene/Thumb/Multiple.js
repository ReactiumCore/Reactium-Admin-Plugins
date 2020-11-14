import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Toolbar from './Toolbar';
import React, { useRef, useEffect } from 'react';
import { TypeIcon } from '../../../../MediaPicker';
import { Scrollbars } from 'react-custom-scrollbars';
import SlideContent from './carousel/SlideContent';
import Reactium, {
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

const Multiple = ({ selection, handle, media }) => {
    const { cx, nav, remove, removeAll } = handle;

    const { Button, DataTable, Icon } = useHookComponent('ReactiumUI');

    const columns = () => {
        const output = {
            thumb: {
                width: '80px',
            },
            url: {
                verticalAlign: 'middle',
            },
            delete: {
                width: '120px',
                textAlign: 'right',
                verticalAlign: 'middle',
            },
        };

        Reactium.Hook.runSync('media-field-data-table-columns', output);

        return output;
    };

    const data = () =>
        _.compact(
            selection.map(({ objectId }) => {
                const item = op.get(media.data, objectId);
                if (!item) return null;

                const thumbnail = op.get(item, 'thumbnail')
                    ? url(item, 'thumbnail')
                    : null;

                op.set(item, 'url', url(item, 'relative'));

                op.set(
                    item,
                    'delete',
                    <>
                        <ContentButton file={item} handle={handle} />
                        <DeleteButton onClick={() => remove(objectId)} />
                    </>,
                );

                op.set(
                    item,
                    'thumb',
                    <Thumbnail {...item} thumbnail={thumbnail} />,
                );

                return item;
            }),
        );

    return (
        <div className={cn(cx('thumbs'), 'multiple')}>
            <Toolbar nav={nav}>
                <div className='delete-all-container'>
                    <Button
                        className='delete-btn'
                        color={Button.ENUMS.COLOR.DANGER}
                        onClick={() => removeAll()}
                        outline>
                        <Icon name='Feather.X' />
                    </Button>
                </div>
            </Toolbar>
            <div className='table'>
                <Scrollbars>
                    <DataTable columns={columns()} data={data()} />
                </Scrollbars>
            </div>
        </div>
    );
};

export { Multiple, Multiple as default };

const ContentButton = ({ handle, file, ...props }) => {
    const tools = useHandle('AdminTools');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const showEditor = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.show(<SlideContent handle={handle} file={file} {...props} />);
    };

    return (
        <Button
            color={Button.ENUMS.COLOR.CLEAR}
            className='content-btn mr-xs-8'
            onClick={showEditor}
            {...props}>
            <Icon name='Feather.Feather' />
        </Button>
    );
};

const DeleteButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            color={Button.ENUMS.COLOR.DANGER}
            className='delete-btn'
            {...props}>
            <Icon name='Feather.X' />
        </Button>
    );
};

const Video = props => {
    const { ext, url } = props;

    const videoRef = useRef();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [, setStatus, isStatus] = useStatus();

    const play = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.mozRequestFullScreen) {
                video.mozRequestFullScreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }

            video.play();
        } else {
            video.pause();
        }
    };

    const updateStatus = e => {
        const { type } = e;
        setStatus(type, true);
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.addEventListener('play', updateStatus);
        video.addEventListener('pause', updateStatus);

        return () => {
            video.removeEventListener('play', updateStatus);
            video.removeEventListener('pause', updateStatus);
        };
    }, [videoRef.current]);

    const ico = isStatus('play') ? 'Feather.Pause' : 'Feather.Play';

    return (
        <div className='thumb'>
            <video width='48' height='36' loop ref={videoRef}>
                <source src={url} type={`video/${ext}`} />
            </video>
            <Button
                color={Button.ENUMS.COLOR.CLEAR}
                className='video-btn'
                onClick={play}>
                <Icon name={ico} />
            </Button>
        </div>
    );
};

const Thumbnail = props => {
    const { thumbnail, type } = props;

    return type !== 'VIDEO' ? (
        <div
            className='thumb'
            style={{ backgroundImage: thumbnail ? `url(${thumbnail})` : null }}>
            {!thumbnail && <TypeIcon type={type} />}
        </div>
    ) : (
        <Video {...props} />
    );
};

const url = (item, which) => {
    switch (which) {
        case 'thumbnail':
            return Reactium.Media.url(op.get(item, 'thumbnail'));

        case 'relative':
            return op.get(item, 'url');

        default:
            return op.get(item, 'redirect.url', op.get(item, 'url'));
    }
};
