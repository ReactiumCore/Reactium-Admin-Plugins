import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
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

const Error = ({ error, field }) => {
    const { focus, message } = error;

    const isError = field => op.get(error, 'field') === field;

    useEffect(() => {
        if (!focus) return;
        try {
            focus.focus();
        } catch (err) {}
    }, [focus]);

    return isError(field) ? <span>{message}</span> : null;
};

let TaxonomyTypeEditor = (props, ref) => {
    const refs = useRef({
        description: null,
        form: null,
        name: null,
        slug: null,
    }).current;

    const { Alert, Button, EventForm, Icon } = useHookComponent('ReactiumUI');

    const [state, update] = useDerivedState({
        error: null,
        value: op.get(props, 'value', null),
    });

    const setRef = (key, elm) => op.set(refs, key, elm);

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const className = field => cn('form-group', { error: isError('name') });

    const dispatch = async (eventType, eventObj, callback) => {
        if (unMounted()) return;
        await Reactium.Hook.run(eventType, eventObj);
        const evt = TaxonomyEvent(eventType, eventObj);
        handle.dispatchEvent(evt);
    };

    const isError = field => {
        if (field) {
            return op.get(state, 'error.field') === field;
        } else {
            return op.get(state, 'error') !== null;
        }
    };

    const save = async value => {
        console.log(value);

        await dispatch('taxonomy-type-before-save', value);

        const valid = await validate(value);

        if (valid !== true) {
            const error = { error: new Error(valid) };
            await dispatch('taxonomy-type-save-error', error);
            return error;
        }

        let saved = op.has(value, 'objectId')
            ? await Reactium.Taxonomy.Type.update(value)
            : await Reactium.Taxonomy.Type.create(value);

        saved = op.has(saved, 'toJSON') ? saved.toJSON() : saved;

        if (!saved) {
            const error = { error: new Error('unable to save taxonomy type') };
            await dispatch('taxonomy-type-save-error', error);
            return error;
        }

        await dispatch('taxonomy-type-saved', saved);

        return saved;
    };

    const unMounted = () => !refs.form;

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
            const exists = await Reactium.Taxonomy.Type.exists({ slug });

            valid = exists
                ? {
                      field: 'slug',
                      focus: refs.slug,
                      message: __('%slug already exists').replace(
                          /\%slug/gi,
                          slug,
                      ),
                  }
                : valid;
        }

        await dispatch('taxonomy-type-validate', { valid, value });

        return valid;
    };

    const onSubmit = async () => {
        // get form value
        const value = refs.form.getValue();

        // execute save operation
        const result = await save(value);

        if (op.has(result, 'error')) {
            // set the error message
            setState({ error: result.error });
        } else {
            // clear the form
            refs.form.setValue(null);
        }

        // return result
        return result;
    };

    const _handle = () => ({
        Error,
        form: refs.form,
        setState,
        state,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle('TaxonomyTypeEditor', () => handle, [handle]);

    useEffect(() => {
        if (!refs.form) return;
        handle['form'] = refs.form;
        setHandle(handle);
    }, [refs.form]);

    return (
        <EventForm onSubmit={onSubmit} ref={elm => setRef('form', elm)}>
            <input
                type='hidden'
                name='objectId'
                value={op.get(state, 'value.objectId')}
            />
            <div className={className('name')}>
                <label>
                    Name:
                    <input
                        type='text'
                        name='name'
                        ref={elm => setRef('name', elm)}
                    />
                </label>
                <Error error={state.error} field='name' />
            </div>
            <div className={className('slug')}>
                <label>
                    Slug:
                    <input
                        type='text'
                        name='slug'
                        ref={elm => setRef('slug', elm)}
                    />
                </label>
                <Error error={state.error} field='slug' />
            </div>
            <div className={className('description')}>
                <label>
                    Description:
                    <textarea
                        name='description'
                        ref={elm => setRef('description', elm)}
                    />
                </label>
                <Error error={state.error} field='description' />
            </div>
        </EventForm>
    );
};

TaxonomyTypeEditor = forwardRef(TaxonomyTypeEditor);

export { TaxonomyTypeEditor, TaxonomyTypeEditor as default };
