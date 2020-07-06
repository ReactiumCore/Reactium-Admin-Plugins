import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../../../enums';
import Reactium, {
    __,
    useAsyncEffect,
    useHandle,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

import React, { useEffect, useState } from 'react';

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

const useLocalState = (defaultState = {}) => {
    const [state, updateState] = useState(defaultState);

    const getState = (key, defaultValue) =>
        !key ? state : op.get(state, key, defaultValue);

    const setState = (newState, newValue, silent = false) => {
        // clear state
        if (!newState) {
            update({});
            return;
        }

        if (_.isString(newState)) {
            newState = { [newState]: newValue };
        }

        newState = Object.keys(newState).reduce((obj, key) => {
            op.set(obj, key, op.get(newState, key));
            return obj;
        }, state);

        if (silent === false) {
            updateState(newState);
        }
    };

    return [state, setState, getState];
};

export default ({ handle, ...props }) => {
    const {
        cx,
        editor,
        fieldName,
        max,
        nav,
        value,
        isActive,
        setSelection,
    } = handle;

    const { Spinner } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const [data, setData] = useState(op.get(editor.state, 'media'));

    const hasData = () => _.isObject(data);

    const isReady = () => {
        if (!value) return;
        if (!editor) return;
        if (!hasData()) return;
        if (!editor.state) return;
        if (value.length < 1) return;
        if (!isActive(props.id)) return;

        return true;
    };

    const load = async () => {
        if (!editor) return;
        if (!isActive(props.id)) return;
        if (!isStatus(ENUMS.STATUS.INIT)) return;

        setStatus(ENUMS.STATUS.LOADING);

        const media = op.get(editor.state, 'media')
            ? editor.state.media
            : await fetchMedia('media-retrieve');

        setStatus(ENUMS.STATUS.LOADED);
        setData(media);
    };

    const onStatusChange = () => {
        if (!isActive(props.id)) return;

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

    return isActive(props.id) ? (
        <>
            {isReady() === true ? (
                max === 1 ? (
                    <SingleFile
                        file={_.last(selection())}
                        handle={handle}
                        media={data}
                    />
                ) : (
                    <Code value={value} />
                )
            ) : (
                <div className={cx('thumbs')}>
                    <Spinner />
                </div>
            )}
        </>
    ) : null;
};

const SingleFile = ({ file, handle, media }) => {
    const { cx, remove } = handle;

    const tools = useHandle('AdminTools');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    const [state, setState, getState] = useLocalState({
        item: file ? op.get(media.data, file.objectId) : null,
    });

    const isReady = () => isStatus(ENUMS.STATUS.READY);

    const load = async () => {
        const { item } = state;

        if (!isStatus(ENUMS.STATUS.INIT)) return;
        if (!item) return;

        if (item.type !== 'IMAGE') {
            setStatus(ENUMS.STATUS.LOADED);
            return;
        }

        setStatus(ENUMS.STATUS.LOADING);

        // get image info
        const imgData = await new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url();
        });

        let { width, height } = imgData;
        const square = width === height;
        const landscape = width > height;
        const portrait = width < height;

        const style = { maxWidth: width, maxHeight: height };
        const cls = cn({ square, landscape, portrait });

        setState({ img: { cls, style } });
        setStatus(ENUMS.STATUS.LOADED, true);
    };

    const url = () => getState('item.redirect.url', getState('item.url'));

    const viewImage = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.show(
            <div className='lightbox' onClick={() => Modal.hide()}>
                <img
                    src={url()}
                    style={{ ...state.img.style, maxHeight: 'none' }}
                />
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
            setStatus(ENUMS.STATUS.READY, true);
        }
    }, [Object.values(state), status]);

    return isReady() ? (
        <div className={cn(cx('thumbs'), 'single')}>
            <img
                className={state.img.cls}
                onClick={viewImage}
                src={url()}
                style={state.img.style}
            />
            <div className='toolbar'></div>
            <Button
                appearance={Button.ENUMS.APPEARANCE.PILL}
                className='delete-btn'
                color={Button.ENUMS.COLOR.DANGER}
                onClick={() => remove(file.objectId)}
                size={Button.ENUMS.SIZE.SM}>
                {__('Remove %type').replace(/\%type/gi, state.item.type)}
            </Button>
        </div>
    ) : null;
};

const Code = ({ value }) => (
    <code style={{ height: '100%', width: '100%' }}>
        <pre>{JSON.stringify(value, null, 2)}</pre>
    </code>
);
