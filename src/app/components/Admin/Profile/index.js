import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { useAvatar } from './hooks';
import { Helmet } from 'react-helmet';
import Reactium from 'reactium-core/sdk';
import { Button, Icon, WebForm } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const ENUMS = {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Profile
 * -----------------------------------------------------------------------------
 */
let Profile = ({ children, user, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
        value: user || Reactium.User.current(),
    });

    const avatar = useAvatar(user);

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

    const cname = cls => {
        const { namespace } = stateRef.current;
        return _.compact([namespace, cls]).join('-');
    };

    const cx = () => {
        const namespace = cname();
        const { className } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
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

    // Renderer
    const render = () => {
        const { value = {} } = stateRef.current;
        return (
            <>
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>Profile</title>
                </Helmet>
                <WebForm ref={containerRef} className={cx()}>
                    <div
                        className={cname('avatar')}
                        style={{ backgroundImage: `url(${avatar})` }}>
                        <Button
                            appearance='circle'
                            color='danger'
                            size='xs'
                            style={{
                                width: 30,
                                height: 30,
                                maxWidth: 30,
                                maxHeight: 30,
                                padding: 0,
                            }}
                            type='button'>
                            <Icon name='Feather.X' size={14} />
                        </Button>
                    </div>
                    <div className={cname('form')}>
                        <h3 className='my-xs-20'>Account Info</h3>
                        <div className='form-group'>
                            <input
                                type='text'
                                name='fname'
                                placeholder='First Name'
                                value={op.get(value, 'fname', '')}
                                onChange={onChange}
                            />
                        </div>
                        <div className='form-group'>
                            <input
                                type='text'
                                name='lname'
                                placeholder='Last Name'
                                value={op.get(value, 'lname', '')}
                                onChange={onChange}
                            />
                        </div>
                        <div className='form-group'>
                            <input
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
                    </div>
                    <div className={cname('footer')}>
                        <Button appearance='pill' block size='md' type='submit'>
                            Save Profile
                        </Button>
                    </div>
                </WebForm>
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

Profile.ENUMS = ENUMS;

Profile.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

Profile.defaultProps = {
    namespace: 'zone-admin-profile-editor',
    className: 'col-xs-12 col-sm-6 col-md-4 col-xl-2 ',
    user: Reactium.User.current(),
};

export { Profile as default };
