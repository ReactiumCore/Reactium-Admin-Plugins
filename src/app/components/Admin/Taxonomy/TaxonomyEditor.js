import cn from 'classnames';
import op from 'object-path';
import slugify from 'slugify';
import { TaxonomyEvent } from './TaxonomyEvent';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
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

let TaxonomyEditor = ({ value, ...props }, ref) => {
    const refs = useRef({
        description: null,
        name: null,
        slug: null,
    }).current;

    const [state, update] = useDerivedState({
        error: null,
        slug: false,
        type: op.get(props, 'type', op.get(value, 'type')),
        objectId: op.get(props, 'objectId', null),
    });

    const setRef = (key, elm) => op.set(refs, key, elm);

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const className = field => cn('form-group', { error: isError(field) });

    const dispatch = async (eventType, eventObj) => {
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

    const onNameChange = e => {
        if (state.slug === true) return;
        const v = e.currentTarget.value;
        refs.slug.value = String(slugify(v)).toLowerCase();
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

        try {
            let saved = op.get(value, 'objectId')
                ? await Reactium.Taxonomy.update(value)
                : await Reactium.Taxonomy.create(value);

            saved = op.get(saved, 'toJSON') ? saved.toJSON() : saved;

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
        } catch (err) {
            return { error: { message: err.message } };
        }
    };

    const unMounted = () => !refs.name;

    const validate = async value => {
        const rqd = {
            name: {
                field: 'name',
                focus: refs.name,
                message: __('name is a required field'),
            },
            slug: {
                field: 'slug',
                focus: refs.slug,
                message: __('slug is a required field'),
            },
        };

        let valid = true;

        for (const key in rqd) {
            if (!op.get(value, key)) {
                valid = op.get(rqd, key);
                break;
            }
        }

        if (valid === true && !op.get(value, 'objectId')) {
            const { slug } = value;
            try {
                let exists = await Reactium.Taxonomy.exists({ slug });
                valid = exists
                    ? {
                          field: 'slug',
                          focus: refs.slug,
                          message: __('%slug %type already exists')
                              .replace(/\%slug/gi, slug)
                              .replace(/\%type/gi, state.type),
                      }
                    : valid;
            } catch (err) {
                valid = {
                    field: 'slug',
                    focus: refs.slug,
                    message: err.message,
                };
            }
        }

        await dispatch('taxonomy-validate', { valid, value });

        return valid;
    };

    const getValue = () => {
        const v = Object.keys(refs).reduce((obj, key) => {
            const elm = op.get(refs, key);
            op.set(obj, key, elm.value || null);
            return obj;
        }, {});

        op.set(v, 'type', state.type);
        return v;
    };

    const clear = () => {
        setState({ error: null, slug: false });

        Object.values(refs).forEach(elm => {
            elm.value = '';
        });
    };

    const _handle = () => ({
        Error,
        clear,
        dispatch,
        getValue,
        refs,
        setState,
        state,
        submit: onSubmit,
        unMounted,
    });

    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle('TaxonomyEditor', () => handle, [handle]);

    return (
        <div className={op.get(props, 'className')}>
            <input
                type='hidden'
                ref={elm => setRef('objectId', elm)}
                defaultValue={op.get(value, 'objectId')}
            />
            <div className={className('name')}>
                <label>
                    <span className='sr-only'>Name:</span>
                    <input
                        type='text'
                        onChange={onNameChange}
                        placeholder={__('Name')}
                        ref={elm => setRef('name', elm)}
                        defaultValue={op.get(value, 'name')}
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
                        defaultValue={op.get(value, 'slug')}
                        onKeyDown={() => setState({ slug: true })}
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
                        defaultValue={op.get(value, 'description')}
                    />
                </label>
                <ErrorMsg error={state.error} field='description' />
            </div>
        </div>
    );
};

TaxonomyEditor = forwardRef(TaxonomyEditor);

export { TaxonomyEditor, TaxonomyEditor as default };
