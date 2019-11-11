import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import Reactium from 'reactium-core/sdk';
import { useAvatar } from 'components/Admin/Profile/hooks';
import { Plugins } from 'reactium-core/components/Plugable';
import { Button, Icon, WebForm } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Profile
 * -----------------------------------------------------------------------------
 */
let Profile = ({ children, user, ...props }, ref) => {
    const defaultAvatar = useAvatar({});

    const u = user || Reactium.User.current();

    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
        value: { ...u },
    });
    const uploadRef = useRef();

    // State
    const [state, setNewState] = useState(stateRef.current);

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

    const cname = cls => {
        const { namespace } = stateRef.current;
        return _.compact([namespace, cls]).join('-');
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    const onSubmit = ({ value }) => {
        setState({ value });
    };

    const onChange = e => {
        const { value } = stateRef.current;
        const { name, value: val } = e.target;

        value[name] = val;
        setState({ value });
    };

    const clearAvatar = () => {
        const { value } = stateRef.current;
        const avatar = op.get(value, 'avatar', '');

        value['avatar'] =
            String(avatar).startsWith('data:') && op.get(u, 'avatar')
                ? u.avatar
                : undefined;

        setState({ value });
    };

    const uploadOpen = () => uploadRef.current.click();

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

    // Renderer
    const render = () => {
        const { className, value = {} } = stateRef.current;
        const avatar = op.get(value, 'avatar', defaultAvatar);
        const me = op.get(u, 'objectId') === op.get(value, 'objectId');

        return (
            <>
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>Profile</title>
                </Helmet>
                <div className={className}>
                    <WebForm
                        value={value}
                        ref={containerRef}
                        className={cname()}>
                        <input
                            type='hidden'
                            name='objectId'
                            value={op.get(value, 'objectId', '')}
                        />
                        <input
                            type='hidden'
                            name='avatar'
                            value={op.get(value, 'avatar', '')}
                        />
                        <input
                            id='avatar'
                            type='file'
                            hidden
                            ref={uploadRef}
                            onChange={selectFile}
                        />
                        <div
                            className={cname('avatar')}
                            style={{
                                backgroundImage: `url(${avatar})`,
                            }}>
                            <AvatarButtons
                                avatar={op.get(value, 'avatar', '')}
                                clear={clearAvatar}
                                upload={uploadOpen}
                            />
                        </div>
                        <div className={cname('form')}>
                            {!me && (
                                <h4 className='mt-xs-20 mb-xs-40 text-center strong'>
                                    {op.get(value, 'username')}
                                </h4>
                            )}

                            <h3 className='my-xs-20'>Account Info</h3>
                            <div className='form-group'>
                                <input
                                    autoComplete='off'
                                    type='text'
                                    name='fname'
                                    placeholder='First Name'
                                    value={op.get(value, 'fname', '')}
                                    onChange={onChange}
                                />
                            </div>
                            <div className='form-group'>
                                <input
                                    autoComplete='off'
                                    type='text'
                                    name='lname'
                                    placeholder='Last Name'
                                    value={op.get(value, 'lname', '')}
                                    onChange={onChange}
                                />
                            </div>
                            <div className='form-group'>
                                <input
                                    autoComplete='off'
                                    type='email'
                                    name='email'
                                    placeholder='Email'
                                    value={op.get(value, 'email', '')}
                                    onChange={onChange}
                                />
                            </div>

                            <div className='flex middle mt-xs-40 mb-xs-20'>
                                <h3 className='flex-grow'>Password</h3>
                                <Button
                                    appearance='pill'
                                    color='tertiary'
                                    size='xs'
                                    type='button'>
                                    Reset
                                </Button>
                            </div>

                            <Plugins zone={cname('form')} />
                        </div>
                        <div className={cname('footer')}>
                            <Button
                                appearance='pill'
                                block
                                size='md'
                                type='submit'>
                                Save Profile
                            </Button>
                        </div>
                    </WebForm>
                </div>
            </>
        );
    };

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
    className: 'col-xs-12 col-sm-6 col-md-4 col-xl-2 ',
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
