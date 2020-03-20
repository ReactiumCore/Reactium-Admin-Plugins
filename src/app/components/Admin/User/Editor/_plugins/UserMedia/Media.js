import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Link } from 'react-router-dom';
import Reactium, { __ } from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Collapsible, Icon } from '@atomic-reactor/reactium-ui';
import {
    ENUMS,
    useActions,
    ActionButton,
} from 'components/Admin/Media/Directory';

const Media = ({ editor, data }) => {
    const [actions] = useActions();

    console.log(actions);
    const render = () => (
        <div className='media'>
            {Object.entries(data).map(([key, item]) => (
                <MediaCard
                    {...item}
                    actions={actions}
                    editor={editor}
                    key={key}
                    objectId={key}
                />
            ))}
        </div>
    );

    return render();
};

const CardInfo = ({ url, editURL }) => {
    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        style: {
            borderRadius: 0,
            flexShrink: 0,
            width: 48,
            padding: 0,
        },
    };

    return (
        <div className='media-info'>
            <div className='label'>
                <a href={url} target='_blank'>
                    {url}
                </a>
            </div>
            <Button {...buttonProps} to={editURL} type={Button.ENUMS.TYPE.LINK}>
                <Icon name='Feather.Edit2' size={20} />
            </Button>
            <Button {...buttonProps}>
                <Icon name='Feather.MoreVertical' />
            </Button>
        </div>
    );
};

const AudioCard = props => {
    const { className, edgeURL, ext, poster, type, url } = props;

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div className={className}>
            <div>
                <div className='media-preview' style={style}>
                    <audio width='100%' height='100%' controls>
                        {!poster && <MediaIcon type={type} />}
                        <source src={edgeURL} type={`audio/${ext}`} />
                        {ENUMS.TEXT.AUDIO_UNSUPPORTED}
                    </audio>
                </div>
                <CardInfo {...props} />
                <div className='media-actions' />
            </div>
        </div>
    );
};

const FileCard = props => {
    const { className, edgeURL, poster, type, url } = props;

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div className={className}>
            <div>
                <div className='media-preview'>
                    <a href={edgeURL} target='_blank' style={style}>
                        {!poster && <MediaIcon type={type} />}
                    </a>
                </div>
                <CardInfo {...props} />
                <div className='media-actions' />
            </div>
        </div>
    );
};

const ImageCard = props => {
    const { className, edgeURL, poster, url } = props;

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div className={className}>
            <div>
                <div className='media-preview'>
                    <a href={edgeURL} target='_blank' style={style} />
                </div>
                <CardInfo {...props} />
                <div className='media-actions' />
            </div>
        </div>
    );
};

const VideoCard = props => {
    const { className, edgeURL, ext, poster, type, url } = props;

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div className={className}>
            <div>
                <div className='media-preview'>
                    <video poster={poster} width='100%' height='100%' controls>
                        <source src={edgeURL} type={`video/${ext}`} />
                        {ENUMS.TEXT.VIDEO_UNSUPPORTED}
                    </video>
                </div>
                <CardInfo {...props} />
                <div className='media-actions' />
            </div>
        </div>
    );
};

const MediaCard = props => {
    let { file, objectId, thumbnail, type } = props;
    type = String(type).toLowerCase();

    const className = cn('media-card', `media-card-${type}`);
    const edgeURL = file && Reactium.Media.url(file);
    const editURL = `/admin/media/edit/${objectId}`;
    const ext = edgeURL.split('.').pop();
    const poster = thumbnail && Reactium.Media.url(thumbnail);

    const cardProps = {
        ...props,
        className,
        edgeURL,
        editURL,
        ext,
        poster,
    };

    switch (type) {
        case 'audio':
            return <AudioCard {...cardProps} />;

        case 'image':
            return <ImageCard {...cardProps} />;

        case 'video':
            return <VideoCard {...cardProps} />;

        default:
            return <FileCard {...cardProps} />;
    }
};

const MediaIcon = ({ type, ...props }) => {
    let name;
    const types = Object.keys(ENUMS.TYPE);
    type = types.includes(type) ? type : 'FILE';

    switch (String(type).toLowerCase()) {
        case 'audio':
            name = 'Linear.MusicNote3';
            break;

        case 'file':
        default:
            name = 'Linear.FileEmpty';
    }

    return <Icon {...props} name={name} />;
};

export { Media, Media as default };
