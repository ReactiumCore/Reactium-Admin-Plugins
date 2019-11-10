import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Helmet } from 'react-helmet';
import Reactium from 'reactium-core/sdk';
import Logo from 'components/common-ui/Logo';
import { Redirect, Link } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Button, WebForm } from '@atomic-reactor/reactium-ui';

const ENUMS = {
    STATUS: {
        ERROR: 'error',
        SUBMITTING: 'submitting',
        READY: 'ready',
        SUCCESS: 'success',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Forgot
 * -----------------------------------------------------------------------------
 */
let Forgot = props => {
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

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    // Side Effects
    useEffect(
        () => setState(props, 'Forgot -> useEffect()'),
        Object.values(props),
    );

    const onSubmit = ({ value, valid }) => {
        const { email } = value;
        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.SUBMITTING) {
            return;
        }

        setState({ ...value, error: {}, status: ENUMS.STATUS.SUBMITTING });

        return Reactium.User.forgot(email)
            .then(result => setState({ status: ENUMS.STATUS.SUCCESS }))
            .catch(err =>
                setState({
                    error: {
                        field: 'email',
                        message: err.message,
                    },
                    status: ENUMS.STATUS.ERROR,
                }),
            );
    };

    const onChange = e => {
        const { name, value } = e.target;
        setState({ [name]: value });
    };

    const onError = ({ value, errors }) => {
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

    // Renderers
    const render = () => {
        if (Reactium.User.getSessionToken()) {
            return <Redirect to={redirect} />;
        }

        const {
            className,
            email,
            error = {},
            signin,
            signup,
            status,
        } = stateRef.current;

        if (status === ENUMS.STATUS.SUCCESS) {
            return (
                <>
                    <Helmet>
                        <meta charSet='utf-8' />
                        <title>Forgot Password</title>
                    </Helmet>
                    <main className={className} role='main'>
                        <WebForm
                            onSubmit={onSubmit}
                            onError={onError}
                            value={{ email }}
                            required={['email']}
                            showError={false}>
                            <div className='flex center mb-xs-40'>
                                <Link to='/'>
                                    <Logo width={80} height={80} />
                                </Link>
                            </div>
                            <h1>Request Sent!</h1>
                            <input type='hidden' name='email' value={email} />
                            <p className='text-center'>
                                Check your
                                <br />
                                <kbd>{email}</kbd>
                                <br />
                                email and follow the directions to reset your
                                password.
                            </p>
                            <div className='mt-xs-40'>
                                <Button
                                    block
                                    color='secondary'
                                    size='lg'
                                    type='submit'
                                    appearance='pill'
                                    disabled={
                                        status === ENUMS.STATUS.SUBMITTING
                                    }>
                                    {status === ENUMS.STATUS.SUBMITTING ? (
                                        <>Sending...</>
                                    ) : (
                                        <>Resend Email</>
                                    )}
                                </Button>
                            </div>
                        </WebForm>
                    </main>
                </>
            );
        }

        return (
            <>
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>Forgot Password</title>
                </Helmet>
                <main className={className} role='main'>
                    <WebForm
                        onSubmit={onSubmit}
                        onError={onError}
                        value={{ email }}
                        required={['email']}
                        showError={false}>
                        <div className='flex center mb-xs-40'>
                            <Link to='/'>
                                <Logo width={80} height={80} />
                            </Link>
                        </div>
                        <h1>Forgot your password?</h1>
                        <p className='text-center'>
                            Reset your password by entering the email address
                            associated with your account.
                        </p>
                        <div
                            className={cn({
                                'form-group': true,
                                error: op.get(error, 'field') === 'email',
                            })}>
                            <input
                                type='email'
                                placeholder='Email Address'
                                name='email'
                                value={email || ''}
                                onChange={onChange}
                                id='email'
                                disabled={status === ENUMS.STATUS.SUBMITTING}
                            />
                            {op.get(error, 'field') === 'email' && (
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
                                    <>Sending...</>
                                ) : (
                                    <>Send Email</>
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
            </>
        );
    };

    return render();
};

Forgot.defaultProps = {
    className: 'password',
    signin: '/login',
    signup: '/signup',
};

export { Forgot as default };
