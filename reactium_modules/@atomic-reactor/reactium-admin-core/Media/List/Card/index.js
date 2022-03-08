import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';
import { Scrollbars } from 'react-custom-scrollbars';

import Reactium, {
    useDerivedState,
    useEventHandle,
    useHookComponent,
    Zone,
} from 'reactium-core/sdk';

import React, { useEffect, useRef } from 'react';

const CardActions = props => {
    const { refs } = props;

    const containerRef = useRef();

    const components = Reactium.Zone.getZoneComponents('media-actions');

    const [state, setNewState] = useDerivedState({
        components,
        expanded: false,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const cname = () =>
        cn('media-actions', {
            expanded: state.expanded,
            collapsed: !state.expanded,
        });

    const collapse = () => setState({ expanded: false });

    const expand = () => setState({ expanded: true });

    const toggle = () => setState({ expanded: !state.expanded });

    const unMounted = () => !containerRef.current;

    const _handle = () => ({
        collapse,
        expand,
        setState,
        state,
        toggle,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // Set ref
    useEffect(() => {
        op.set(refs, 'actions.current', handle);
    });

    // Update handle
    useEffect(() => {
        const newHandle = _handle();
        if (!_.isEqual(newHandle, handle)) {
            setHandle(newHandle);
        }
    }, Object.values(state));

    return _.isEmpty(state.components) ? null : (
        <div className={cname()} ref={containerRef}>
            <Scrollbars>
                <div className='container'>
                    <Zone zone='media-actions' {...props} />
                </div>
            </Scrollbars>
        </div>
    );
};

const CardInfo = ({ editURL, redirect = {}, refs, url }) => {
    const redirectURL = op.get(redirect, 'url');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const buttonProps = {
        color: Button.ENUMS.COLOR.CLEAR,
        style: {
            borderRadius: 0,
            flexShrink: 0,
            width: 48,
            padding: 0,
        },
    };

    const toggleActions = () => {
        if (!refs.actions.current) return;
        refs.actions.current.toggle();
    };

    return (
        <div className='media-info'>
            <div className='label break-word'>
                <a href={url} target='_blank'>
                    {url}
                </a>
            </div>
            {!redirectURL && (
                <Button
                    {...buttonProps}
                    to={editURL}
                    type={Button.ENUMS.TYPE.LINK}>
                    <Icon name='Feather.Edit2' size={20} />
                </Button>
            )}
            <Button {...buttonProps} onClick={toggleActions}>
                <Icon name='Feather.MoreVertical' />
            </Button>
        </div>
    );
};

const AudioCard = props => {
    const { className, edgeURL, ext, poster, refs, type } = props;

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div
            className={className}
            onMouseLeave={() => refs.actions.current.collapse()}>
            <div>
                <div className='media-preview' style={style}>
                    <audio width='100%' height='100%' controls>
                        {!poster && <MediaIcon type={type} />}
                        <source src={edgeURL} type={`audio/${ext}`} />
                        {ENUMS.TEXT.AUDIO_UNSUPPORTED}
                    </audio>
                    <CardActions {...props} />
                </div>
                <CardInfo {...props} />
            </div>
        </div>
    );
};

const FileCard = props => {
    const { className, editURL, poster, redirect = {}, refs, type } = props;
    const redirectURL = op.get(redirect, 'url');

    const style = poster && {
        backgroundImage: `url('${poster}')`,
    };

    return (
        <div
            className={className}
            onMouseLeave={() => refs.actions.current.collapse()}>
            <div>
                <div className='media-preview'>
                    {redirectURL ? (
                        <a href={redirectURL} target='_blank' style={style}>
                            {!poster && <MediaIcon type={type} />}
                        </a>
                    ) : (
                        <Link to={redirectURL || editURL} style={style}>
                            {!poster && <MediaIcon type={type} />}
                        </Link>
                    )}
                    <CardActions {...props} />
                </div>
                <CardInfo {...props} />
            </div>
        </div>
    );
};

const ImageCard = props => {
    const { className, editURL, poster, redirect = {}, refs, url } = props;
    const redirectURL = op.get(redirect, 'url');
    const style = {
        backgroundImage: `url('${redirectURL || poster || url}')`,
    };

    return (
        <div
            className={className}
            onMouseLeave={() => refs.actions.current.collapse()}>
            <div>
                <div className='media-preview'>
                    {redirectURL ? (
                        <a href={redirectURL} target='_blank' style={style} />
                    ) : (
                        <Link to={editURL} style={style} />
                    )}
                    <CardActions {...props} />
                </div>
                <CardInfo {...props} />
            </div>
        </div>
    );
};

const VideoCard = props => {
    const { className, edgeURL, poster, refs } = props;

    return (
        <div
            className={className}
            onMouseLeave={() => refs.actions.current.collapse()}>
            <div>
                <div className='media-preview'>
                    <ReactPlayer
                        controls
                        width='100%'
                        height='100%'
                        url={edgeURL}
                        poster={poster}
                    />
                    <CardActions {...props} />
                </div>
                <CardInfo {...props} />
            </div>
        </div>
    );
};

const MediaIcon = ({ type, ...props }) => {
    let name;
    const types = Object.keys(ENUMS.TYPE);
    type = types.includes(type) ? type : 'FILE';

    const { Icon } = useHookComponent('ReactiumUI');

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

const MediaCard = props => {
    const refs = { actions: useRef() };
    let { objectId, thumbnail, type, url: edgeURL = '' } = props;
    type = String(type).toLowerCase();

    const className = cn('media-card', `media-card-${type}`);
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
        refs,
    };

    if (!objectId) return null;

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

export {
    AudioCard,
    FileCard,
    ImageCard,
    MediaCard,
    MediaCard as default,
    VideoCard,
};
