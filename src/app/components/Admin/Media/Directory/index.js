import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import domain from '../domain';
import copy from 'copy-to-clipboard';
import { Scrollbars } from 'react-custom-scrollbars';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useEffect, useState } from 'react';
import Reactium, {
    useDerivedState,
    useHandle,
    useSelect,
} from 'reactium-core/sdk';
import ConfirmBox from 'components/Admin/registered-components/ConfirmBox';

const ActionButton = ({
    color = 'default',
    icon,
    iconSize = 16,
    id,
    objectId,
    onClick,
    tooltip,
}) => (
    <div className='media-actions-button'>
        <Button
            appearance='circle'
            color={color || 'default'}
            data-action={id}
            data-align='left'
            data-file={objectId}
            data-tooltip={tooltip}
            data-vertical-align='middle'
            onClick={e => onClick(e)}>
            <Icon name={icon} size={iconSize} />
        </Button>
    </div>
);

const useActions = () => {
    const [actions, setActions] = useState();
    const [status, setStatus] = useState(ENUMS.STATUS.INIT);

    useEffect(() => {
        if (status !== ENUMS.STATUS.INIT) return;
        if (!actions) {
            const acts = {};
            setStatus(ENUMS.STATUS.PENDING);

            Reactium.Hook.run('media-file-actions', acts).then(() => {
                setStatus(ENUMS.STATUS.READY);
                setActions(acts);
            });
        }
    }, [actions, status]);

    return actions || {};
};

export default () => {
    const actions = useActions();

    const Media = useHandle(domain.name);

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const history = useSelect(state => op.get(state, 'Router.history'));

    const [state, setState] = useDerivedState({
        status: ENUMS.STATUS.INIT,
    });

    const [library, setLibrary] = useState(op.get(Media.state, 'library', []));

    const Toast = op.get(tools, 'Toast');

    const page = op.get(Media.state, 'page', 1);

    const directory = op.get(Media.state, 'directory');

    const confirmDelete = file => {
        const url = op.get(library, [file, 'url']);

        Modal.show(
            <ConfirmBox
                message={
                    <>
                        {ENUMS.TEXT.DELETE_INFO[0]}
                        <div className='my-xs-8'>
                            <kbd>{url}</kbd>
                        </div>
                        {ENUMS.TEXT.DELETE_INFO[1]}
                    </>
                }
                onCancel={() => Modal.dismiss()}
                onConfirm={e => onDelete(file)}
                title={ENUMS.TEXT.CONFIRM_DELETE}
            />,
        );
    };

    const isAudio = ext => ENUMS.TYPE.AUDIO.includes(String(ext).toUpperCase());

    const isImage = ext => ENUMS.TYPE.IMAGE.includes(String(ext).toUpperCase());

    const isVideo = ext => ENUMS.TYPE.VIDEO.includes(String(ext).toUpperCase());

    const isOther = ext => !isImage(ext) && !isVideo(ext) && !isAudio(ext);

    const onActionClick = e => {
        const { action, file } = e.currentTarget.dataset;

        switch (action) {
            case 'copy-to-clipboard':
                onCopyClick(file);
                break;

            case 'edit-audio':
            case 'edit-image':
            case 'edit-other':
            case 'edit-video':
                history.push('/admin/media/edit/' + file);
                break;

            case 'view-file':
                onViewFile(file);
                break;

            case 'download':
                onDownloadFile(file);
                break;

            case 'delete':
                confirmDelete(file);
                break;
        }
    };

    const onDownloadFile = file => Reactium.Media.download(file);

    const onViewFile = file => window.open(Reactium.Media.url(file), '_blank');

    const onCopyClick = file => {
        const url = Reactium.Media.url(file);
        if (url) {
            copy(url);
            Toast.show({
                icon: 'Linear.ClipboardCheck',
                message: ENUMS.TEXT.COPIED_TO_CLIPBOARD,
                type: Toast.TYPE.INFO,
            });
        }
    };

    const onDelete = file => {
        Modal.dismiss();
        return Reactium.Media.delete(file);
    };

    const _onSearch = () =>
        setLibrary(
            Reactium.Media.filter({ limit: 20, search, directory, page }),
        );

    const onSearch = _.throttle(_onSearch, 300, {
        leading: true,
        trailing: true,
    });

    const renderAudio = item => {
        const { ext, file, filename, meta, objectId, thumbnail, url } = item;
        const edgeURL = file && Reactium.Media.url(file);
        const poster = thumbnail && Reactium.Media.url(thumbnail);
        const title = op.get(meta, 'title');

        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('audio'),
        );

        const style = poster && {
            backgroundImage: `url('${poster}')`,
        };

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <div className='media-audio' style={style}>
                        {!poster && <Icon name='Linear.MusicNote3' />}
                        <audio width='100%' height='100%' controls>
                            <source src={edgeURL} type={`audio/${ext}`} />
                            {ENUMS.TEXT.AUDIO_UNSUPPORTED}
                        </audio>
                    </div>
                    <div className='media-info'>
                        <div className='text'>
                            {title && <div>{title}</div>}
                            <div>{url}</div>
                        </div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={() => onCopyClick(file)}
                                id='copy-to-clipboard'
                                icon='Linear.ClipboardDown'
                                iconSize={20}
                                objectId={objectId}
                                tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
                            />
                        </div>
                    </div>
                    <div className='media-actions'>
                        <Scrollbars
                            style={{ height: '100%' }}
                            autoHeight={true}
                            autoHeightMin='100%'>
                            <div className='py-xs-8'>
                                {acts.map(action => (
                                    <ActionButton
                                        key={`media-action-${action.id}`}
                                        onClick={op.get(
                                            action,
                                            'onClick',
                                            onActionClick,
                                        )}
                                        {...item}
                                        {...action}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        );
    };

    const renderImage = item => {
        const {
            ext,
            file,
            filename,
            meta = {},
            objectId,
            thumbnail,
            url,
        } = item;

        const edgeURL = Reactium.Media.url(file);
        const poster = thumbnail && Reactium.Media.url(thumbnail);
        const bg = { backgroundImage: `url('${poster || edgeURL}')` };

        const acts = _.sortBy(
            Object.values(actions),
            'order',
        ).filter(({ types = [] }) => types.includes('image'));

        const title = op.get(meta, 'title');

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <a
                        href={edgeURL}
                        style={bg}
                        className='media-image'
                        target='_blank'
                    />
                    <div className='media-info'>
                        <div className='text'>
                            {title && <div>{title}</div>}
                            <div>{url}</div>
                        </div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={() => onCopyClick(file)}
                                id='copy-to-clipboard'
                                icon='Linear.ClipboardDown'
                                iconSize={20}
                                objectId={objectId}
                                tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
                            />
                        </div>
                    </div>
                    <div className='media-actions'>
                        <Scrollbars
                            style={{ height: '100%' }}
                            autoHeight={true}
                            autoHeightMin='100%'>
                            <div className='py-xs-8'>
                                {acts.map(action => (
                                    <ActionButton
                                        key={`media-action-${action.id}`}
                                        onClick={op.get(
                                            action,
                                            'onClick',
                                            onActionClick,
                                        )}
                                        {...item}
                                        {...action}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        );
    };

    const renderOther = item => {
        const { ext, file, filename, meta, objectId, thumbnail, url } = item;
        const edgeURL = file && Reactium.Media.url(file);
        const poster = thumbnail && Reactium.Media.url(thumbnail);
        const title = op.get(meta, 'title');

        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('other'),
        );

        const style = poster && {
            backgroundImage: `url('${poster}')`,
        };

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <div className='media-other' style={style}>
                        <a href={edgeURL} target='_blank'>
                            {!poster && <Icon name='Linear.FileEmpty' />}
                        </a>
                    </div>
                    <div className='media-info'>
                        <div className='text'>
                            {title && <div>{title}</div>}
                            <div>{url}</div>
                        </div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={() => onCopyClick(file)}
                                id='copy-to-clipboard'
                                icon='Linear.ClipboardDown'
                                iconSize={20}
                                objectId={objectId}
                                tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
                            />
                        </div>
                    </div>
                    <div className='media-actions'>
                        <Scrollbars
                            style={{ height: '100%' }}
                            autoHeight={true}
                            autoHeightMin='100%'>
                            <div className='py-xs-8'>
                                {acts.map(action => (
                                    <ActionButton
                                        key={`media-action-${action.id}`}
                                        onClick={op.get(
                                            action,
                                            'onClick',
                                            onActionClick,
                                        )}
                                        {...item}
                                        {...action}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        );
    };

    const renderVideo = item => {
        const { ext, file, filename, meta, objectId, thumbnail, url } = item;
        const edgeURL = file && Reactium.Media.url(file);
        const poster = thumbnail && Reactium.Media.url(thumbnail);
        const title = op.get(meta, 'title');

        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('video'),
        );

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <div className='media-video'>
                        <video
                            poster={poster}
                            width='100%'
                            height='100%'
                            controls>
                            <source src={edgeURL} type={`video/${ext}`} />
                            {ENUMS.TEXT.VIDEO_UNSUPPORTED}
                        </video>
                    </div>
                    <div className='media-info'>
                        <div className='text'>
                            {title && <div>{title}</div>}
                            <div>{url}</div>
                        </div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={() => onCopyClick(file)}
                                id='copy-to-clipboard'
                                icon='Linear.ClipboardDown'
                                iconSize={20}
                                objectId={objectId}
                                tooltip={ENUMS.TEXT.COPY_TO_CLIPBOARD}
                            />
                        </div>
                    </div>
                    <div className='media-actions'>
                        <Scrollbars
                            style={{ height: '100%' }}
                            autoHeight={true}
                            autoHeightMin='100%'>
                            <div className='py-xs-8'>
                                {acts.map(action => (
                                    <ActionButton
                                        key={`media-action-${action.id}`}
                                        onClick={op.get(
                                            action,
                                            'onClick',
                                            onActionClick,
                                        )}
                                        {...item}
                                        {...action}
                                    />
                                ))}
                            </div>
                        </Scrollbars>
                    </div>
                </div>
            </div>
        );
    };

    const render = () => {
        return (
            <div className={Media.cname('directory')}>
                {Object.values(library).map(file => {
                    const { ext } = file;

                    if (isAudio(ext)) {
                        return renderAudio(file);
                    }

                    if (isImage(ext)) {
                        return renderImage(file);
                    }

                    if (isVideo(ext)) {
                        return renderVideo(file);
                    }

                    return renderOther(file);
                })}
            </div>
        );
    };

    useEffect(() => {
        onSearch();
    }, [page, search, directory, op.get(Media.state, 'library', {})]);

    return render();
};
