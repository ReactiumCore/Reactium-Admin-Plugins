import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import domain from '../domain';
import copy from 'copy-to-clipboard';
import { Scrollbars } from 'react-custom-scrollbars';
import ConfirmBox from 'components/Admin/ConfirmBox';
import Reactium, { useHandle, useSelect } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useEffect, useRef, useState } from 'react';

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

export default () => {
    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const stateRef = useRef({
        status: ENUMS.STATUS.PENDING,
        actions: {},
    });

    const [, setNewState] = useState(stateRef.current);

    const setState = newState => {
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        setNewState(stateRef.current);
    };

    const tools = useHandle('AdminTools');

    const Media = useHandle(domain.name);

    const Modal = op.get(tools, 'Modal');

    const Toast = op.get(tools, 'Toast');

    const page = op.get(Media.state, 'page', 1);

    const library = _.sortBy(op.get(Media.state, ['library', page], {}), 'ext');

    const isImage = ext => ENUMS.TYPE.IMAGE.includes(String(ext).toUpperCase());

    const isVideo = ext => ENUMS.TYPE.VIDEO.includes(String(ext).toUpperCase());

    const isOther = ext => !isImage(ext) && !isVideo(ext);

    const onActionClick = e => {
        const { action, file } = e.currentTarget.dataset;

        switch (action) {
            case 'copy-to-clipboard':
                onCopyClick(file);
                break;

            case 'edit-image':
                break;

            case 'edit-other':
                break;

            case 'edit-video':
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

    const onDownloadFile = file => {
        Reactium.Media.download(file);
    };

    const onViewFile = file => {
        const url = Reactium.Media.url(file);
        window.open(url, '_blank');
    };

    const onCopyClick = file => {
        const url = Reactium.Media.url(file);
        if (url) {
            copy(url);
            Toast.show({
                icon: (
                    <span className='mr-xs-4'>
                        <Icon name='Linear.ClipboardCheck' />
                    </span>
                ),
                message: ENUMS.TEXT.COPIED_TO_CLIPBOARD,
                type: Toast.TYPE.INFO,
            });
        }
    };

    const onDelete = file => {
        Modal.dismiss();
        return Reactium.Media.delete(file);
    };

    const onSearch = _.throttle(params => Reactium.Media.fetch(params), 500, {
        leading: false,
        trailing: true,
    });

    const confirmDelete = file => {
        const { library = {} } = Media.state;
        const url = op.get(library, [page, file, 'url']);

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

    const renderImage = item => {
        const { actions } = stateRef.current;
        const { ext, file, filename, meta, objectId, url } = item;
        const edgeURL = file.url().replace('undefined', '/api');
        const bg = { backgroundImage: `url('${edgeURL}')` };
        const acts = _.sortBy(
            Object.values(actions),
            'order',
        ).filter(({ types = [] }) => types.includes('image'));

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <a
                        href={Reactium.Media.url(objectId)}
                        style={bg}
                        className='media-image'
                        target='_blank'
                    />
                    <div className='media-info'>
                        <div className='text'>{url}</div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={onActionClick}
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
        const { actions } = stateRef.current;
        const { ext, file, filename, meta, objectId, url } = item;
        const edgeURL = file.url().replace('undefined', '/api');
        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('video'),
        );

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <div className='media-video'>
                        <video width='100%' height='100%' controls>
                            <source src={edgeURL} type={`video/${ext}`} />
                            {ENUMS.TEXT.VIDEO_UNSUPPORTED}
                        </video>
                    </div>
                    <div className='media-info'>
                        <div className='text'>{url}</div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={onActionClick}
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
        const { actions } = stateRef.current;
        const { ext, filename, meta, objectId, url } = item;
        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('other'),
        );
        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <a
                        className='media-image'
                        href={Reactium.Media.url(objectId)}
                        target='_blank'>
                        <Icon name='Linear.FileEmpty' size={96} />
                    </a>
                    <div className='media-info'>
                        <div className='text'>{url}</div>
                        <div className='buttons'>
                            <ActionButton
                                color='clear'
                                onClick={onActionClick}
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
        const images = Object.values(library).filter(({ ext }) => isImage(ext));
        const videos = Object.values(library).filter(({ ext }) => isVideo(ext));
        const others = Object.values(library).filter(({ ext }) => isOther(ext));
        return (
            <div className={Media.cname('directory')}>
                {images.map(file => renderImage(file))}
                {videos.map(file => renderVideo(file))}
                {others.map(file => renderOther(file))}
            </div>
        );
    };

    useEffect(() => {
        const { actions = {}, status } = stateRef.current;

        if (status === ENUMS.STATUS.READY || status === ENUMS.STATUS.PROCESSING)
            return;

        stateRef.current.status = ENUMS.STATUS.PROCESSING;

        Reactium.Hook.run('media-file-actions', actions).then(() => {
            setState({ actions, status: ENUMS.STATUS.READY });
        });
    }, [op.get(stateRef.current, 'status')]);

    useEffect(() => {
        onSearch();
    }, [search]);

    return render();
};
