import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import domain from '../domain';
import { Scrollbars } from 'react-custom-scrollbars';
import ConfirmBox from 'components/Admin/ConfirmBox';
import Reactium, { useHandle } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import React, { useEffect, useRef, useState } from 'react';

const ActionButton = ({
    color,
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

    const page = op.get(Media.state, 'page', 1);

    const library = _.sortBy(op.get(Media.state, ['library', page], {}), 'ext');

    const isImage = ext => ENUMS.TYPE.IMAGE.includes(String(ext).toUpperCase());

    const isVideo = ext => ENUMS.TYPE.VIDEO.includes(String(ext).toUpperCase());

    const isOther = ext => !isImage(ext) && !isVideo(ext);

    const onActionClick = e => {
        const { action, file } = e.currentTarget.dataset;

        switch (action) {
            case 'edit':
                break;

            case 'delete':
                showDelete({ action, file });
                break;
        }
    };

    const onDelete = async ({ file }) => {
        Reactium.Media.delete(file);
        Modal.dismiss();
    };

    const showDelete = ({ action, file }) => {
        const { library = {} } = Media.state;
        const url = op.get(library, [page, file, 'url']);

        Modal.show(
            <ConfirmBox
                message={
                    <>
                        <p className='mb-xs-8'>{ENUMS.TEXT.DELETE_INFO[0]}</p>
                        <kbd>{url}</kbd>
                        <p className='mt-xs-8'>{ENUMS.TEXT.DELETE_INFO[1]}</p>
                    </>
                }
                onCancel={() => Modal.dismiss()}
                onConfirm={e => onDelete({ action, file })}
                title={ENUMS.TEXT.CONFIRM_DELETE}
            />,
        );
    };

    const renderImage = item => {
        const { actions } = stateRef.current;
        const { ext, file, filename, meta, objectId, url } = item;
        const edgeURL = file.url().replace('undefined', '/api');
        const bg = { backgroundImage: `url('${edgeURL}')` };
        const acts = Object.values(actions).filter(({ types = [] }) =>
            types.includes('image'),
        );

        return (
            <div id={`file-${objectId}`} key={`file-${objectId}`}>
                <div className='media-card'>
                    <div style={bg} className='media-image' />
                    <div className='media-info'>{url}</div>
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
                    <div className='media-info'>{url}</div>
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
                    <div className='media-image'>
                        <Icon name='Linear.FileEmpty' size={96} />
                    </div>
                    <div className='media-info'>{url}</div>
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

    return render();
};
