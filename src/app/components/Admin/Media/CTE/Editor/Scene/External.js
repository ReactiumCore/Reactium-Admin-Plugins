import _ from 'underscore';
import op from 'object-path';
import ENUMS from '../../../enums';
import React, { useCallback, useMemo } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useStatus,
} from 'reactium-core/sdk';

export default ({ handle }) => {
    const {
        add,
        back,
        cx,
        directories,
        editor,
        max,
        nav,
        refs,
        setDirectories,
        setSelection,
        value,
    } = handle;

    const { Alert, Button, Carousel, Icon, Slide, Spinner } = useHookComponent(
        'ReactiumUI',
    );

    const defaultIcon = useMemo(() => 'Feather.HelpCircle');
    const defaultMessage = useMemo(() =>
        __('Select directory and enter the fully qualified URL to a file'),
    );

    const getDirectory = () => {
        const directoryInput = refs.get('url.directory.input');
        const directorySelect = refs.get('url.directory.select');
        return directoryInput.value || directorySelect.value;
    };

    const [, setStatus, isStatus] = useStatus(ENUMS.STATUS.READY);
    const [state, setState] = useDerivedState({
        error: null,
        icon: defaultIcon,
        message: defaultMessage,
        values: value,
    });

    const unMounted = () => !refs.get('url.container');

    const onSubmit = async e => {
        if (op.get(e, 'type') === 'keydown' && op.get(e, 'which') !== 13) {
            return;
        }

        if (!isStatus(ENUMS.STATUS.READY)) return;

        const input = refs.get('url.input');
        const url = input.value;

        if (!url) {
            setState({
                error: {
                    message: __('URL is required'),
                    icon: 'Feather.AlertOctagon',
                },
            });
            input.focus();
            return;
        }

        if (
            !String(url)
                .toLowerCase()
                .startsWith('http')
        ) {
            setState({
                error: {
                    message: __('URL must start with http: or https:'),
                    icon: 'Feather.AlertOctagon',
                },
            });
            input.select();
            return;
        }

        setStatus(ENUMS.STATUS.PENDING);

        setState({
            error: null,
            message: __('Fetching file...'),
            icon: 'Feather.DownloadCloud',
        });

        // timeout
        const timeout = setTimeout(() => {
            if (unMounted()) return;
            setStatus(ENUMS.STATUS.READY);
            setState({
                error: {
                    message: __('Fetch timed out'),
                    icon: 'Feather.CloudOff',
                },
            });
        }, 25000);

        try {
            const directory = getDirectory();
            setDirectories(directory);

            const { error, result } = await Reactium.Media.createFromURL({
                url,
                directory,
            });

            clearTimeout(timeout);

            if (unMounted()) return;

            setStatus(ENUMS.STATUS.READY);

            if (error) {
                setState({
                    error: {
                        message: __('Unable to create Media file'),
                        icon: 'Feather.AlertOctagon',
                    },
                });
                return;
            }

            _.defer(() => onSuccess(result));
        } catch (err) {
            clearTimeout(timeout);

            if (unMounted()) return;

            setStatus(ENUMS.STATUS.READY);
            setState({
                error: {
                    message: err.message,
                    icon: 'Feather.CloudOff',
                },
            });
            return;
        }
    };

    const onSuccess = result => {
        const input = refs.get('url.input');

        setState({
            error: null,
            message: __('Created Media file %filename').replace(
                /\%filename/gi,
                result.filename,
            ),
            icon: 'Feather.Check',
        });

        input.value = '';
        input.focus();

        if (op.get(editor.state, 'media')) {
            const { media } = editor.state;
            let { data, directories = [] } = media;
            op.set(data, result.objectId, result);
            directories.push(result.directory);
            directories = _.uniq(directories);
            directories.sort();

            op.set(media, 'directories', directories);
            op.set(media, 'data', data);
            editor.setState({ media });
        }

        const { objectId, url } = result;

        _.defer(() => add({ objectId, url }));
    };

    const render = useCallback(() => {
        const clr = state.error
            ? Alert.ENUMS.COLOR.DANGER
            : Alert.ENUMS.COLOR.PRIMARY;
        const ico = state.error ? state.error.icon : state.icon;
        const msg = state.error ? state.error.message : state.message;

        return (
            <div
                className={cx('external')}
                ref={elm => refs.set('url.container', elm)}>
                <div className='block'>
                    <Alert icon={<Icon name={ico} />} color={clr}>
                        {msg}
                    </Alert>
                </div>
                <div className='block mt-xs-24'>
                    <Carousel ref={elm => refs.set('url.carousel', elm)}>
                        <Slide>
                            <div className='input-group'>
                                <select
                                    ref={elm =>
                                        refs.set('url.directory.select', elm)
                                    }>
                                    <option value='uploads'>
                                        {__('Select directory')}
                                    </option>
                                    {directories.map(dir => (
                                        <option key={`dir-${dir}`}>
                                            {dir}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    color={Button.ENUMS.COLOR.TERTIARY}
                                    data-tooltip={__('New directory')}
                                    data-align='left'
                                    data-vertical-align='middle'
                                    disabled={!isStatus(ENUMS.STATUS.READY)}
                                    onClick={() => {
                                        const carousel = refs.get(
                                            'url.carousel',
                                        );
                                        carousel.next();
                                    }}>
                                    <Icon name='Feather.Plus' />
                                </Button>
                            </div>
                        </Slide>
                        <Slide>
                            <div className='input-group'>
                                <input
                                    type='text'
                                    ref={elm =>
                                        refs.set('url.directory.input', elm)
                                    }
                                    placeholder={__('directory')}
                                    readOnly={!isStatus(ENUMS.STATUS.READY)}
                                />
                                <Button
                                    color={Button.ENUMS.COLOR.DANGER}
                                    disabled={!isStatus(ENUMS.STATUS.READY)}
                                    onClick={() => {
                                        const carousel = refs.get(
                                            'url.carousel',
                                        );
                                        carousel.prev();
                                        setTimeout(() => {
                                            refs.get(
                                                'url.directory.input',
                                            ).value = '';
                                        }, 500);
                                    }}>
                                    <Icon name='Feather.X' />
                                </Button>
                            </div>
                        </Slide>
                    </Carousel>
                </div>
                <div className='block mt-xs-24'>
                    <div className='input-group'>
                        <input
                            type='url'
                            ref={elm => refs.set('url.input', elm)}
                            placeholder={__('https://')}
                            onKeyDown={onSubmit}
                            readOnly={!isStatus(ENUMS.STATUS.READY)}
                        />
                        <Button
                            color={Button.ENUMS.COLOR.PRIMARY}
                            data-tooltip={__('Import')}
                            data-align='left'
                            data-vertical-align='middle'
                            disabled={!isStatus(ENUMS.STATUS.READY)}
                            onClick={onSubmit}>
                            <Icon name='Feather.DownloadCloud' />
                        </Button>
                    </div>
                </div>
                {!isStatus(ENUMS.STATUS.READY) && (
                    <div className='flex-grow flex-middle flex-center block'>
                        <Spinner />
                    </div>
                )}
                {isStatus(ENUMS.STATUS.READY) && (
                    <div className='back-btn'>
                        <Button color={Button.ENUMS.COLOR.CLEAR} onClick={back}>
                            <Icon name='Feather.X' size={18} />
                        </Button>
                    </div>
                )}
            </div>
        );
    });

    return render();
};
