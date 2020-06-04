import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import { TaxonomyEvent } from './TaxonomyEvent';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
} from 'reactium-core/sdk';

const ErrorMsg = ({ error = {}, field }) => {
    const focus = op.get(error, 'focus');
    const message = op.get(error, 'message');

    const isError = field => op.get(error, 'field') === field;

    useEffect(() => {
        if (!focus) return;
        try {
            focus.focus();
        } catch (err) {}
    }, [focus]);

    return isError(field) ? <small>{message}</small> : null;
};

let TaxonomyEditor = (props, ref) => {
    const refs = useRef({
        description: null,
        name: null,
        slug: null,
    }).current;

    const { Alert, Button, EventForm, Icon } = useHookComponent('ReactiumUI');

    const [state, update] = useDerivedState({
        error: null,
        type: op.get(props, 'type'),
        objectId: op.get(props, 'objectId', null),
    });

    const setRef = (key, elm) => op.set(refs, key, elm);

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const className = field => cn('form-group', { error: isError(field) });

    const dispatch = async (eventType, eventObj, callback) => {
        if (unMounted()) return;
        await Reactium.Hook.run(eventType, eventObj);
        const evt = new TaxonomyEvent(eventType, eventObj);
        handle.dispatchEvent(evt);
    };

    const isError = field => {
        if (field) {
            return op.get(state, 'error.field') === field;
        } else {
            return op.get(state, 'error') !== null;
        }
    };

    const onSubmit = async () => {
        // get form value
        const value = getValue();

        // execute save operation
        const result = await save(value);

        if (op.has(result, 'error')) {
            // set the error message
            setState({ error: result.error });
        } else {
            // clear the form
            clear();
        }

        // return result
        return result;
    };

    const save = async value => {
        await dispatch('taxonomy-before-save', { value });

        const valid = await validate(value);

        if (valid !== true) {
            const error = { error: valid, value };
            await dispatch('taxonomy-save-error', error);
            return error;
        }

        let { slug } = value;
        slug = String(slugify(slug)).toLowerCase();
        op.set(value, 'slug', slug);

        await dispatch('taxonomy-save', { value });

        let saved = op.has(value, 'objectId')
            ? await Reactium.Taxonomy.update(value)
            : await Reactium.Taxonomy.create(value);

        saved = op.has(saved, 'toJSON') ? saved.toJSON() : saved;

        if (!saved) {
            const error = {
                error: { message: __('unable to save taxonomy') },
                value,
            };
            await dispatch('taxonomy-save-error', error);
            return error;
        }

        await dispatch('taxonomy-saved', { result: saved, value });

        return saved;
    };

    const unMounted = () => !refs.name;

    const validate = async value => {
        const rqd = {
            slug: {
                field: 'slug',
                focus: refs.slug,
                message: __('slug is a required field'),
            },
            name: {
                field: 'name',
                focus: refs.name,
                message: __('name is a required field'),
            },
        };

        let valid = true;

        for (const key in rqd) {
            if (!op.has(value, key)) {
                valid = op.get(rqd, key);
                break;
            }
        }

        if (valid === true) {
            const { slug } = value;
            const exists = await Reactium.Taxonomy.exists({ slug });

            valid = exists
                ? {
                      field: 'slug',
                      focus: refs.slug,
                      message: __('%slug %type already exists')
                          .replace(/\%slug/gi, slug)
                          .replace(/\%type/gi, state.type),
                  }
                : valid;
        }

        await dispatch('taxonomy-validate', { valid, value });

        return valid;
    };

    const getValue = () => {
        const value = Object.keys(refs).reduce((obj, key) => {
            const elm = op.get(refs, key);

            if (!elm.value) return obj;
            op.set(obj, key, elm.value);

            return obj;
        }, {});

        op.set(value, 'type', state.type);
        return value;
    };

    const clear = () => {
        setState({ error: null });

        Object.values(refs).forEach(elm => {
            elm.value = '';
        });
    };

    const _handle = () => ({
        Error,
        clear,
        dispatch,
        getValue,
        setState,
        state,
        submit: onSubmit,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle('TaxonomyEditor', () => handle, [handle]);

    return (
        <div className={op.get(props, 'className')}>
            <input type='hidden' ref={elm => setRef('objectId', elm)} />
            <div className={className('name')}>
                <label>
                    <span className='sr-only'>Name:</span>
                    <input
                        type='text'
                        placeholder={__('Name')}
                        ref={elm => setRef('name', elm)}
                    />
                </label>
                <ErrorMsg error={state.error} field='name' />
            </div>
            <div className={className('slug')}>
                <label>
                    <span className='sr-only'>Slug:</span>
                    <input
                        type='text'
                        placeholder={__('Slug')}
                        ref={elm => setRef('slug', elm)}
                    />
                </label>
                <ErrorMsg error={state.error} field='slug' />
            </div>
            <div className={className('description')}>
                <label>
                    <span className='sr-only'>Description:</span>
                    <textarea
                        ref={elm => setRef('description', elm)}
                        placeholder={__('Description')}
                    />
                </label>
                <ErrorMsg error={state.error} field='description' />
            </div>
        </div>
    );
};

TaxonomyEditor = forwardRef(TaxonomyEditor);

export { TaxonomyEditor, TaxonomyEditor as default };
