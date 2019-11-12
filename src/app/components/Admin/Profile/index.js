import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Reactium, { useHandle, useSelect } from 'reactium-core/sdk';
import { useAvatar } from 'components/Admin/Profile/hooks';
import { Plugins } from 'reactium-core/components/Plugable';
import { Button, Icon, Spinner, WebForm } from '@atomic-reactor/reactium-ui';
import ConfirmBox from 'components/Admin/ConfirmBox';
import inputs from './inputs';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const ENUMS = {
    STATUS: {
        COMPLETE: 'COMPLETE',
        ERROR: 'ERROR',
        INIT: 'INIT',
        SAVING: 'SAVING',
    },
};

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const getValue = (value = {}) =>
    _.chain(inputs)
        .pluck('name')
        .value()
        .reduce((obj, name) => {
            obj[name] = op.get(value, name, '');
            return obj;
        }, {});

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Profile
 * -----------------------------------------------------------------------------
 */
let Profile = ({ children, user, ...props }, ref) => {
    const history = useSelect(state => op.get(state, 'Router.history'));

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const defaultAvatar = useAvatar({});

    const u = user || Reactium.User.current();

    // Refs
    const containerRef = useRef();
    const uploadRef = useRef();
    const stateRef = useRef({
        ...props,
        error: {},
        status: ENUMS.STATUS.INIT,
        value: getValue({ ...u }),
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const disabled = () => {
        const { status } = stateRef.current;
        const statuses = [ENUMS.STATUS.SAVING];
        return statuses.includes(status);
    };

    const cname = cls => {
        const { namespace } = stateRef.current;
        return _.compact([namespace, cls]).join('-');
    };

    const clearAvatar = () => {
        if (disabled()) {
            return;
        }

        const { value } = stateRef.current;

        const avatar = op.get(value, 'avatar', '');

        value['avatar'] =
            String(avatar).startsWith('data:') && op.get(u, 'avatar')
                ? u.avatar
                : null;

        setState({ value });
    };

    const uploadOpen = () => {
        if (disabled()) {
            return;
        }

        uploadRef.current.click();
    };

    const fileReader = file =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => {
                reader.abort();
                reject();
            };

            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

    const selectFile = async e => {
        const elm = e.target;
        const files = elm.files;

        if (files.length < 1) {
            return;
        }

        const file = _.first(files);
        const { value } = stateRef.current;
        const data = await fileReader(file);

        value['avatar'] = data;

        elm.value = '';

        setState({ value });
    };

    const resetPassword = async () => {
        // Update the modal content
        Modal.update(
            <div
                className='flex center middle bg-grey-light'
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                }}>
                <Spinner />
            </div>,
        );

        // Generate token
        const token = await Reactium.Cloud.run('token-gen');

        // Sign out
        await Reactium.User.logOut();

        // Hide modal and show reset screen
        await new Promise(resolve =>
            setTimeout(() => {
                Modal.hide();
                history.replace(`/reset/${token}`);
                resolve();
            }, 2000),
        );
    };

    const resetConfirm = () => {
        if (disabled()) {
            return;
        }

        const Message = () => (
            <>
                <p>Resetting your password will sign you out.</p>
                Are you sure?
            </>
        );
        Modal.show(
            <ConfirmBox
                title='Reset Password'
                message={<Message />}
                onConfirm={resetPassword}
            />,
        );
    };

    const onSubmit = ({ value }) => {
        if (disabled()) {
            return;
        }

        op.del(value, 'type');

        setState({ error: {}, status: ENUMS.STATUS.SAVING, value });
    };

    const onError = ({ errors }) => {
        const error = {
            field: op.get(errors, 'fields.0'),
            message: op.get(errors, 'errors.0'),
        };

        error['focus'] = op.get(error, 'field');

        setState({ error });
    };

    const onChange = e => {
        if (disabled()) {
            return;
        }

        const { value } = stateRef.current;
        const { name, value: val } = e.target;

        value[name] = val;
        setState({ value });
    };

    const isError = name => {
        const { error = {} } = stateRef.current;

        const field = op.get(error, 'field');
        const message = op.get(error, 'message');

        return message && field === name;
    };

    const isMe = () => {
        const { value = {} } = stateRef.current;
        return op.get(u, 'objectId') === op.get(value, 'objectId');
    };

    const RenderInputs = () => {
        const { error, value = {} } = stateRef.current;

        return inputs.map((input, i) => {
            const item = { ...input };
            const key = `${cname('form-input')}-${i}`;

            // Headings
            if (op.get(item, 'type') === 'heading') {
                const heading = { ...item };
                op.del(heading, 'type');
                op.del(heading, 'value');
                op.set(heading, 'className', 'mt-xs-32 mb-xs-20');

                return <h3 key={key} {...heading} />;
            }

            // Inputs
            op.set(item, 'value', op.get(value, item.name, '') || '');
            op.del(item, 'required');

            // Hidden Inputs
            if (op.get(item, 'type') === 'hidden') {
                return <input key={key} {...item} />;
            }

            // Add onChange listener
            op.set(item, 'onChange', onChange);

            // Set disabled if saving
            op.set(item, 'disabled', disabled());

            // Check if it's an error input
            const err = isError(item.name);

            // Normal inputs
            return (
                <div
                    key={key}
                    className={cn({
                        'form-group': true,
                        error: err,
                    })}>
                    <input {...item} />
                    {err && <small>{op.get(error, 'message')}</small>}
                </div>
            );
        });
    };

    // Renderer
    const render = () => {
        let { className, value = {} } = stateRef.current;
        value = getValue(value);
        const avatar = op.get(value, 'avatar', defaultAvatar) || defaultAvatar;

        const required = _.chain(_.where(inputs, { required: true }))
            .pluck('name')
            .value();

        return (
            <>
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>
                        {disabled() ? 'Profile | Saving...' : 'Profile'}
                    </title>
                </Helmet>
                <div className={className}>
                    <WebForm
                        className={cname()}
                        onError={onError}
                        onSubmit={onSubmit}
                        ref={containerRef}
                        showError={false}
                        value={value}
                        required={required}>
                        <div
                            className={cname('avatar')}
                            style={{
                                backgroundImage: `url(${avatar})`,
                            }}>
                            <AvatarButtons
                                avatar={op.get(u, 'avatar')}
                                clear={clearAvatar}
                                upload={uploadOpen}
                            />
                        </div>
                        <div className={cname('form')}>
                            {!isMe() && (
                                <h4 className='mt-xs-20 mb-xs-40 text-center strong'>
                                    {op.get(value, 'username')}
                                </h4>
                            )}

                            <RenderInputs />

                            <div className='flex middle mt-xs-40 mb-xs-20'>
                                <h3 className='flex-grow'>Password</h3>
                                <Button
                                    appearance='pill'
                                    color='tertiary'
                                    size='xs'
                                    type='button'
                                    onClick={resetConfirm}>
                                    Reset
                                </Button>
                            </div>

                            <Plugins zone={cname('form')} />
                        </div>
                        <div className={cname('footer')}>
                            <Button
                                appearance='pill'
                                block
                                disabled={disabled()}
                                size='md'
                                type='submit'>
                                {disabled() ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                        <input
                            type='file'
                            ref={uploadRef}
                            hidden
                            onChange={selectFile}
                        />
                    </WebForm>
                </div>
            </>
        );
    };

    // Side Effects
    useEffect(() => setState(props), [op.get(props, 'value')]);

    useLayoutEffect(() => {
        const focus = op.get(stateRef.current, 'error.focus');
        const elm = document.getElementsByName(focus)[0];

        if (elm) {
            elm.select();
        }
    }, [op.get(stateRef.current, 'error.focus')]);

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
    }));

    // Render
    return render();
};

Profile = forwardRef(Profile);

Profile.defaultProps = {
    namespace: 'zone-admin-profile-editor',
    className: 'col-xs-12 col-sm-6 col-lg-4',
};

const AvatarButtons = ({ avatar, clear, upload }) => (
    <div
        className='flex mb-xs--8'
        style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button
            appearance='circle'
            color='tertiary'
            onClick={upload}
            size='xs'
            title='Upload'
            data-tooltip
            data-vertical-align='middle'
            data-align='left'
            style={{
                width: 30,
                height: 30,
                maxWidth: 30,
                maxHeight: 30,
                padding: 0,
                justifySelf: avatar ? 'start' : 'end',
            }}
            type='button'>
            <Icon
                name={avatar ? 'Feather.Edit2' : 'Feather.Plus'}
                size={avatar ? 16 : 18}
            />
        </Button>
        {avatar && (
            <Button
                appearance='circle'
                color='danger'
                onClick={clear}
                title='Remove'
                data-tooltip
                data-vertical-align='middle'
                data-align='right'
                size='xs'
                style={{
                    width: 30,
                    height: 30,
                    maxWidth: 30,
                    maxHeight: 30,
                    padding: 0,
                    marginLeft: 8,
                }}
                type='button'>
                <Icon name='Feather.X' size={16} />
            </Button>
        )}
    </div>
);

export { Profile as default };
