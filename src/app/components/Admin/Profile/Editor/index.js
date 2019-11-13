import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import AvatarButtons from './AvatarButtons';
import ConfirmBox from 'components/Admin/ConfirmBox';
import { Plugins } from 'reactium-core/components/Plugable';

import { Button, Icon, Spinner, WebForm } from '@atomic-reactor/reactium-ui';

import Reactium, {
    useHandle,
    useRegisterHandle,
    useSelect,
} from 'reactium-core/sdk';

import {
    useProfileAvatar,
    useProfileInputs,
} from 'components/Admin/Profile/hooks';

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
        READY: 'READY',
        SAVING: 'SAVING',
    },
};

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Profile
 * -----------------------------------------------------------------------------
 */
let Profile = ({ children, user, zone, ...props }, ref) => {
    const u = user || Reactium.User.current();

    const defaultAvatar = useProfileAvatar({});

    const inputs = useProfileInputs();

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const getValue = (value = {}) =>
        _.chain(inputs)
            .pluck('name')
            .value()
            .reduce((obj, name) => {
                if (name !== 'type') {
                    obj[name] = op.get(value, name, '');
                }
                return obj;
            }, {});

    // Refs
    const containerRef = useRef();
    const uploadRef = useRef();
    const stateRef = useRef({
        ...props,
        error: {},
        status: ENUMS.STATUS.INIT,
        value: getValue({ ...u }),
        visible: false,
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

    // Return the disabled state if the profile is saving
    const disabled = () => {
        const { status } = stateRef.current;
        const statuses = [ENUMS.STATUS.SAVING];
        return statuses.includes(status);
    };

    // Class name helper
    const cname = cls => {
        const { namespace } = stateRef.current;
        return _.compact([namespace, cls]).join('-');
    };

    // Clear the avatar
    const clearAvatar = () => {
        if (disabled()) {
            return;
        }

        const { value } = stateRef.current;

        const avatar = op.get(value, 'avatar') || null;

        value['avatar'] =
            String(avatar).startsWith('data:') && op.get(u, 'avatar')
                ? u.avatar
                : null;

        setState({ value });
    };

    // Show the file upload dialog
    const uploadOpen = () => {
        if (disabled()) {
            return;
        }

        uploadRef.current.click();
    };

    // Convert the selected file to base64
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

    // Handle file selection
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

    // Hide/Show
    const toggle = () => {
        const { visible } = stateRef.current;
        setState({ visible: !visible });
    };

    // Hide Profile editor
    const hide = () => setState({ visible: false });

    // Show Profile editor
    const show = () => setState({ visible: true });

    // Determine if the user is the current user
    const isMe = () => {
        const { value = {} } = stateRef.current;
        return op.get(u, 'objectId') === op.get(value, 'objectId');
    };

    // Show Error in Toast notification
    const toastError = (error, value) => {
        Toast.show({
            autoClose: 5000,
            type: Toast.TYPE.ERROR,
            message: 'Unable to save profile',
            icon: (
                <Icon name='Linear.AlertOctagon' style={{ marginRight: 12 }} />
            ),
        });

        setState({ error, status: ENUMS.STATUS.ERROR, value });
    };

    // Show Success in Toast notification
    const toastSuccess = (message = 'Profile Updated!') =>
        Toast.show({
            autoClose: 1000,
            icon: <Icon name='Linear.Rocket' />,
            message,
            type: Toast.TYPE.INFO,
        });

    // Handle form submission
    const onSubmit = async ({ value }) => {
        if (disabled()) {
            return;
        }

        setState({ error: {}, status: ENUMS.STATUS.SAVING, value });

        const context = await Reactium.Hook.run('profile-save', value);

        // NO, NO, NO.
        // Hooks shouldn't be able to change the objectId!
        op.del(context, 'objectId');

        // Delete context meta
        op.del(context, 'hook');
        op.del(context, 'params');

        value = { ...value, ...context };

        op.del(value, 'type');

        let userObj;
        try {
            userObj = await Reactium.Cloud.run('user-save', value).then(
                result => {
                    return isMe()
                        ? Reactium.User.current(true).fetch()
                        : result;
                },
            );

            if (userObj) {
                toastSuccess();

                hide();

                setState({
                    error: {},
                    status: ENUMS.STATUS.COMPLETE,
                    value: getValue(userObj.toJSON()),
                });
            } else {
                toastError({ message: 'Unable to save profile' }, value);
            }
        } catch (err) {
            toastError({ message: 'Unable to save profile' }, value);
        }
    };

    // Handle form submission error
    const onError = ({ errors }) => {
        const error = {
            field: op.get(errors, 'fields.0'),
            message: op.get(errors, 'errors.0'),
        };

        error['focus'] = op.get(error, 'field');

        setState({ error });
    };

    // Handle input change
    const onChange = e => {
        if (disabled()) {
            return;
        }

        const { value } = stateRef.current;
        const { name, value: val } = e.target;

        value[name] = val;
        setState({ value });
    };

    // Determine which element has the error
    const isError = name => {
        const { error = {} } = stateRef.current;

        const field = op.get(error, 'field');
        const message = op.get(error, 'message');

        return message && field === name;
    };

    // Render the form inputs from the inputs object
    const RenderInputs = ({ error, value = {} }) => {
        return inputs.map((input, i) => {
            const { type } = input;
            if (!type) {
                return null;
            }

            const item = { ...input };
            const key = `${cname('form-input')}-${i}`;

            // Headings
            if (type === 'heading') {
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
            if (type === 'hidden') {
                return <input key={key} {...item} />;
            }

            // Add onChange listener
            op.set(item, 'onChange', onChange);

            // Set disabled if saving
            op.set(item, 'disabled', disabled());

            // Check if it's an error input
            const err = isError(item.name);

            const className = cn({ 'form-group': true, error: err });

            switch (type) {
                default:
                    return (
                        <div key={key} className={className}>
                            {type === 'textarea' ? (
                                <textarea {...item} />
                            ) : (
                                <input {...item} />
                            )}
                            {err && <small>{op.get(error, 'message')}</small>}
                        </div>
                    );
            }
        });
    };

    // Renderer
    const render = () => {
        let { error, value = {}, visible = false } = stateRef.current;
        value = getValue(value);
        const avatar = op.get(value, 'avatar', defaultAvatar) || defaultAvatar;

        const required = _.chain(_.where(inputs, { required: true }))
            .pluck('name')
            .value();

        const cls = cn({
            [cname()]: true,
            visible,
        });

        return (
            <div className={cls} ref={containerRef}>
                <WebForm
                    className={cls}
                    onError={onError}
                    onSubmit={onSubmit}
                    showError={false}
                    value={value}
                    required={required}>
                    <div className={cname('bg')} onClick={hide} />
                    <div className={cname('container')}>
                        <div className={cname('avatar')}>
                            <div
                                className={cname('avatar-image')}
                                style={{
                                    backgroundImage: `url(${avatar})`,
                                }}
                            />
                            <div className={cname('avatar-buttons')}>
                                <AvatarButtons
                                    avatar={avatar}
                                    clear={clearAvatar}
                                    defaultAvatar={defaultAvatar}
                                    upload={uploadOpen}
                                />
                            </div>
                        </div>
                        <div className={cname('form')}>
                            <div className='mx-xs-32'>
                                <input
                                    type='file'
                                    ref={uploadRef}
                                    hidden
                                    onChange={selectFile}
                                />

                                {RenderInputs({ error, value })}

                                <Plugins
                                    disabled={disabled()}
                                    state={stateRef.current}
                                    zone={`${cname('form')}`}
                                />

                                {children}
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
                        </div>
                        <div className={cname('close-button')}>
                            <Button color='clear' size='xs' onClick={hide}>
                                <Icon name='Feather.X' />
                            </Button>
                        </div>
                    </div>
                </WebForm>
            </div>
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

    useLayoutEffect(() => {
        let { status } = stateRef.current;

        if (status === ENUMS.STATUS.INIT || status === ENUMS.STATUS.COMPLETE) {
            status = ENUMS.STATUS.READY;
            setState({ status });
        }
    }, [op.get(stateRef.current, 'status')]);

    // External Interface
    const handle = () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
        updated: op.get(u, 'updatedAt'),
        visible: op.get(stateRef.current, 'visible'),
        toggle,
        hide,
        show,
    });

    useImperativeHandle(ref, handle);

    useRegisterHandle('ProfileEditor', handle, [op.get(u, 'updatedAt')]);

    // Render
    return render();
};

Profile = forwardRef(Profile);

Profile.defaultProps = {
    namespace: 'admin-profile-editor',
};

export { Profile as default };

/**
 * @api {Hook} profile-save profile-save
 * @apiDescription Customize the profile user data object before saving.

_Note: This data will NOT appear in the Profile Editor unless you have added a cooresponding input field via the `profile-inputs` hook._
 * @apiName profile-save
 * @apiGroup Reactium.Hooks
 * @apiParam {Object} user The user data object.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-save', (user, context) => {
    context['Foobar'] = 'Fubar';
});
 */

/**
 * @api {Hook} profile-save-error profile-save-error
 * @apiDescription Triggered after an error during the Profile Editor save routine.
 * @apiName profile-save-error
 * @apiGroup Reactium.Hooks
 * @apiParam {Object} user The user data object.
 * @apiParam {Object} error The error object.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-save-error', (user, error, context) => {
    // Do something with the error
});
 */

/**
 * @api {Hook} profile-save-complete profile-save-complete
 * @apiDescription Triggered after Profile Editor save routine is successfully completed.
 * @apiName profile-save-complete
 * @apiGroup Reactium.Hooks
 * @apiParam {Object} user The user data object.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-save-complete', (user, context) => {
    // Do something with
});
 */
