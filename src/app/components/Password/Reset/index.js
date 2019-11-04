import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import Logo from 'components/common-ui/Logo';
import { Redirect, Link } from 'react-router-dom';
import { useSelect } from 'reactium-core/easy-connect';
import React, { useEffect, useRef, useState } from 'react';
import { Button, WebForm } from '@atomic-reactor/reactium-ui';

const ENUMS = {
    DEBUG: false,
    STATUS: {
        ERROR: 'error',
        SUBMITTING: 'submitting',
        READY: 'ready',
        SUCCESS: 'success',
        COMPLETE: 'complete',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Reset
 * -----------------------------------------------------------------------------
 */
let Reset = props => {
    const token = useSelect({
        select: state => op.get(state, 'Router.params.token'),
    });

    // Refs
    const stateRef = useRef({
        ...props,
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        if (ENUMS.DEBUG && caller) {
            console.log('setState()', caller, {
                state: stateRef.current,
            });
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    // Side Effects
    useEffect(
        () => setState(props, 'Reset -> useEffect()'),
        Object.values(props),
    );

    const cname = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const onChange = e => {
        const { name, value } = e.target;
        setState({ [name]: value });
    };

    const onError = ({ errors }) => {
        const field = op.get(errors, 'fields.0');
        const message = op.get(errors, 'errors.0');

        setState({
            error: {
                field,
                message,
            },
            status: ENUMS.STATUS.ERROR,
        });

        const elm = document.getElementById(field);
        if (elm) {
            elm.focus();
        }
    };

    const onSubmit = ({ value }) => {
        const { confirm, password } = value;

        if (confirm !== password) {
            onError({
                errors: {
                    errors: ['passwords do not match'],
                    fields: ['password'],
                },
            });
            return;
        }

        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.SUBMITTING) {
            return;
        }

        setState({ ...value, error: {}, status: ENUMS.STATUS.SUBMITTING });

        return Reactium.User.reset(token, password)
            .then(result => {
                setState({ status: ENUMS.STATUS.SUCCESS });

                setTimeout(
                    () => setState({ status: ENUMS.STATUS.COMPLETE }),
                    100,
                );
            })
            .catch(err => {
                setState({
                    error: {
                        message: err.message,
                    },
                    status: ENUMS.STATUS.ERROR,
                });
            });
    };

    // Renderers
    const render = () => {
        const {
            confirm,
            error = {},
            password,
            signin,
            signup,
            status,
        } = stateRef.current;

        if (Reactium.User.getSessionToken()) {
            return <Redirect to={redirect} />;
        }

        if (!token || status === ENUMS.STATUS.COMPLETE) {
            return <Redirect to={signin} />;
        }

        const msg =
            status === ENUMS.STATUS.SUCCESS || status === ENUMS.STATUS.COMPLETE
                ? 'Password Reset!'
                : 'Enter your new password';

        return (
            <main className={cname()} role='main'>
                <WebForm
                    onSubmit={onSubmit}
                    onError={onError}
                    value={{ password, confirm }}
                    required={['password', 'confirm']}
                    showError={false}>
                    <div className='flex center mb-xs-40'>
                        <Link to='/'>
                            <Logo width={80} height={80} />
                        </Link>
                    </div>
                    <h1>Reset Password</h1>
                    {op.get(error, 'message') && !op.get(error, 'field') ? (
                        <p className='text-center red'>{error.message}</p>
                    ) : (
                        <p className='text-center'>{msg}</p>
                    )}
                    <div
                        className={cn({
                            'form-group': true,
                            error: op.get(error, 'field') === 'password',
                        })}>
                        <input
                            type='password'
                            placeholder='Password'
                            name='password'
                            id='password'
                            autoComplete='off'
                            value={password || ''}
                            onChange={onChange}
                            disabled={status === ENUMS.STATUS.SUBMITTING}
                        />
                        {op.get(error, 'field') === 'password' && (
                            <small>{error.message}</small>
                        )}
                    </div>
                    <div
                        className={cn({
                            'form-group': true,
                            error: op.get(error, 'field') === 'confirm',
                        })}>
                        <input
                            type='password'
                            placeholder='Confirm'
                            name='confirm'
                            id='confirm'
                            autoComplete='off'
                            value={confirm || ''}
                            onChange={onChange}
                            disabled={status === ENUMS.STATUS.SUBMITTING}
                        />
                        {op.get(error, 'field') === 'confirm' && (
                            <small>{error.message}</small>
                        )}
                    </div>

                    <div className='mt-xs-40'>
                        <Button
                            block
                            color='secondary'
                            size='lg'
                            type='submit'
                            appearance='pill'
                            disabled={status === ENUMS.STATUS.SUBMITTING}>
                            {status === ENUMS.STATUS.SUBMITTING ? (
                                <>Updating...</>
                            ) : (
                                <>Submit</>
                            )}
                        </Button>
                    </div>
                    <div className='links'>
                        <div className='col-xs-12 col-sm-6 text-xs-center text-sm-left pr-xs-0 pr-sm-8 mt-xs-16'>
                            <Link to={signin}>Sign In</Link>
                        </div>
                        <div className='col-xs-12 col-sm-6 text-xs-center text-sm-right pl-xs-0 pl-sm-8 mt-xs-16'>
                            <Link to={signup}>Create Account</Link>
                        </div>
                    </div>
                </WebForm>
            </main>
        );
    };

    return render();
};

Reset.defaultProps = {
    namespace: 'password',
    signin: '/login',
    signup: '/signup',
};

export { Reset as default };
