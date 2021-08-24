import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import { bytesConvert } from '../_utils';
import React, { useEffect, useRef } from 'react';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { Button, Icon, Progress } from '@atomic-reactor/reactium-ui';
import Reactium, {
    useDerivedState,
    useDocument,
    useAsyncEffect,
} from 'reactium-core/sdk';
import { useStore } from '@atomic-reactor/use-select';

export default ({ delay = 250, onRemoveFile, uploads }) => {
    const iDoc = useDocument();

    const store = useStore();
    const animationRef = useRef({});
    const [state, setState] = useDerivedState({
        uploads: uploads || op.get(store.getState(), 'Media.uploads'),
    });

    const clearUploads = async () => {
        if (Reactium.Media.completed.length < 1) return;

        const cleared = [];

        for (let item of Reactium.Media.completed) {
            const { ID, file } = item;
            await collapse(ID);
            cleared.push({ ...file, ID });
        }

        _onRemoveFile(cleared);
    };

    const collapse = ID => {
        if (animationRef.current[ID]) return animationRef.current[ID];

        const elm = iDoc.getElementById(`upload-${ID}`);
        if (!elm) return Promise.resolve();

        animationRef.current[ID] = true;

        return new Promise(resolve => {
            elm.style.overflow = 'hidden';
            TweenMax.to(elm, 0.125, {
                height: 0,
                opacity: 0,
                ease: Power2.easeIn,
                onComplete: () => resolve(ID),
            });
        });
    };

    const cx = cls => _.compact(['admin-media', cls]).join('-');

    const getIcon = filename => {
        if (isImage(filename)) return null;

        const type = String(getType(filename)).toUpperCase();

        if (ENUMS.TYPE.VIDEO.includes(type))
            return <Icon size={36} name='Linear.FileVideo' />;

        if (ENUMS.TYPE.AUDIO.includes(type))
            return <Icon size={36} name='Linear.Mic' />;

        return <Icon size={36} name='Linear.FileEmpty' />;
    };

    const getStyle = ({ file, filename }) =>
        isImage(filename) ? { backgroundImage: `url(${file.dataURL})` } : null;

    const getType = filename =>
        String(filename)
            .split('.')
            .pop();

    const isImage = filename =>
        ['png', 'svg', 'gif', 'jpg', 'jpeg'].includes(getType(filename));

    const _onRemoveFile = files => {
        files = Array.isArray(files) ? files : [files];

        Reactium.Media.cancel(files);

        files.forEach(file => {
            const ID = op.get(file, 'ID');
            if (ID) delete animationRef.current[ID];
            if (typeof onRemoveFile === 'function') onRemoveFile(file);
        });
    };

    // Watch for uploads
    useAsyncEffect(isMounted => {
        const unsub = store.subscribe(() => {
            const currentUploads = op.get(store.getState(), 'Media.uploads');
            if (isMounted()) setState({ uploads: currentUploads });
        });

        return unsub;
    }, []);

    // Clear uploads
    useEffect(() => {
        Reactium.Pulse.register('MediaClearUploads', clearUploads, { delay });

        return () => {
            Reactium.Pulse.unregister('MediaClearUploads');
        };
    }, []);

    const render = () => {
        const currentUploads = op.get(state, 'uploads');

        return Object.values(currentUploads).length < 1 ? null : (
            <div className={cx('uploads')}>
                <ul>
                    {Object.values(currentUploads).map((upload, i) => {
                        const file = op.get(upload, 'file');
                        const filename = op.get(upload, 'filename');
                        const style = getStyle({ file, filename });
                        const status = op.get(upload, 'status');
                        const size = bytesConvert(op.get(upload, 'total', 0));
                        const url = op.get(upload, 'url', '...');

                        const progress =
                            status === ENUMS.STATUS.COMPLETE
                                ? 1
                                : op.get(upload, 'progress', 0);
                        return (
                            <li
                                id={`upload-${file.ID}`}
                                key={`media-upload-${i}`}
                                className={cn(status, cx('upload'))}>
                                <div
                                    className={cn(status, cx('upload-image'))}
                                    children={getIcon(filename)}
                                    style={style}
                                />
                                <div className={cn(status, cx('upload-info'))}>
                                    <div className={cx('upload-name')}>
                                        {filename}
                                        {' • '}
                                        <span className={cx('upload-size')}>
                                            {size}
                                        </span>
                                    </div>
                                    <div style={{ width: 150 }}>
                                        <Progress
                                            size='xs'
                                            color='primary'
                                            value={progress}
                                            appearance='pill'
                                        />
                                    </div>
                                    <div className={cx('upload-url')}>
                                        {url}
                                    </div>
                                </div>
                                <div
                                    className={cn(status, cx('upload-status'))}>
                                    {status}
                                </div>
                                <div
                                    className={cn(status, cx('upload-action'))}>
                                    {status === ENUMS.STATUS.COMPLETE && (
                                        <Button
                                            size='xs'
                                            color='primary'
                                            appearance='circle'
                                            onClick={() => _onRemoveFile(file)}>
                                            <Icon
                                                name='Feather.Check'
                                                size={18}
                                            />
                                        </Button>
                                    )}

                                    {status === ENUMS.STATUS.QUEUED && (
                                        <Button
                                            onClick={() => _onRemoveFile(file)}
                                            size='xs'
                                            color='danger'
                                            appearance='circle'>
                                            <Icon name='Feather.X' size={18} />
                                        </Button>
                                    )}

                                    {status === ENUMS.STATUS.UPLOADING && (
                                        <Button
                                            size='xs'
                                            color='primary'
                                            disabled
                                            appearance='circle'>
                                            <Icon
                                                name='Feather.ArrowUp'
                                                size={18}
                                            />
                                        </Button>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return render();
};
