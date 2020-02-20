import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import { Helmet } from 'react-helmet';
import { Redirect, Link } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { Button, WebForm } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Forgot
 * -----------------------------------------------------------------------------
 */
let Forgot = props => {
    const Logo = useHookComponent('Logo');

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
                        <title>{ENUMS.TEXT.TITLE}</title>
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
                            <h1>{ENUMS.TEXT.SUCCESS}</h1>
                            <input type='hidden' name='email' value={email} />
                            <p className='text-center'>
                                {ENUMS.TEXT.MESSAGE_SUCCESS[0]}
                                <br />
                                <kbd>{email}</kbd>
                                <br />
                                {ENUMS.TEXT.MESSAGE_SUCCESS[1]}
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
                                    {status === ENUMS.STATUS.SUBMITTING
                                        ? ENUMS.TEXT.BUTTON.RESENDING
                                        : ENUMS.TEXT.BUTTON.RESEND}
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
                    <title>{ENUMS.TEXT.TITLE}</title>
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
                        <h1>{ENUMS.TEXT.TITLE}</h1>
                        <p className='text-center'>{ENUMS.TEXT.MESSAGE}</p>
                        <div
                            className={cn({
                                'form-group': true,
                                error: op.get(error, 'field') === 'email',
                            })}>
                            <input
                                type='email'
                                placeholder={ENUMS.TEXT.LABEL.EMAIL}
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
                                {status === ENUMS.STATUS.SUBMITTING
                                    ? ENUMS.TEXT.BUTTON.SUBMITTING
                                    : ENUMS.TEXT.BUTTON.SUBMIT}
                            </Button>
                        </div>
                        <div className='links'>
                            <div className='col-xs-12 col-sm-6 text-xs-center text-sm-left pr-xs-0 pr-sm-8 mt-xs-16'>
                                <Link to={signin}>
                                    {ENUMS.TEXT.LABEL.SIGNIN}
                                </Link>
                            </div>
                            <div className='col-xs-12 col-sm-6 text-xs-center text-sm-right pl-xs-0 pl-sm-8 mt-xs-16'>
                                <Link to={signup}>
                                    {ENUMS.TEXT.LABEL.CREATE}
                                </Link>
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
