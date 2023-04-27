import _ from 'underscore';
import Single from './Single';
import Multiple from './Multiple';
import ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-core/Media/enums';

import Reactium, {
    useAsyncEffect,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

import React, { useEffect, useRef, useState } from 'react';

const fetchMedia = async hookID => {
    const results = await Reactium.Media.fetch({ page: -1 }).then(results => ({
        data: results.files,
        directories: results.directories,
        error: null,
        fetched: true,
        update: Date.now(),
    }));

    if (hookID) await Reactium.Hook.run(hookID, results);

    return results;
};

const Thumb = ({ handle }) => {
    const contRef = useRef();
    const { cx, max, value } = handle;

    const { Spinner } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const [data, setData] = useState(Reactium.Cache.get('editor.media'));

    const hasData = () => _.isObject(data);

    const isReady = () => {
        if (!value) return;
        if (!hasData()) return;
        if (value.length < 1) return;
        // if (!isActive(props.id)) return;

        return true;
    };

    const load = async () => {
        // if (!isActive(props.id)) return;
        if (!isStatus(ENUMS.STATUS.INIT)) return;

        setStatus(ENUMS.STATUS.LOADING);

        const media =
            Reactium.Cache.get('editor.media') ||
            (await fetchMedia('media-retrieve'));

        setStatus(ENUMS.STATUS.LOADED);
        _.defer(() => setData(media));
    };

    const onStatusChange = () => {
        // if (!isActive(props.id)) return;

        if (isStatus(ENUMS.STATUS.LOADED)) {
            setStatus(ENUMS.STATUS.READY, true);
            return;
        }
    };

    const selection = () => _.reject(value, { delete: true });

    // Data load
    useAsyncEffect(load);

    // Status change
    useEffect(onStatusChange, [status]);

    return (
        <>
            {isReady() === true ? (
                max === 1 ? (
                    <Single
                        file={_.last(selection())}
                        handle={handle}
                        media={data}
                        ref={contRef}
                    />
                ) : (
                    <Multiple
                        selection={selection()}
                        handle={handle}
                        media={data}
                        ref={contRef}
                    />
                )
            ) : (
                <div className={cx('thumbs')} ref={contRef}>
                    <Spinner />
                </div>
            )}
        </>
    );
};

export { Thumb, Thumb as default };
