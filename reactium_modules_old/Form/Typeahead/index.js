import LUNR from 'lunr';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, {
    useHookComponent,
    useIsContainer,
    useRefs,
    useStatus,
    useSyncState,
    useDispatcher,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Typeahead
 * -----------------------------------------------------------------------------
 */
let Typeahead = (
    {
        children,
        className,
        containerStyle,
        data: initialData,
        defaultValue,
        editable,
        labelField,
        maxResults,
        namespace,
        renderItemFunction,
        value: initialValue,
        valueField,
        onChange,
        onSearch,
        onSelect,
        ...props
    },
    ref,
) => {
    initialValue = initialValue || defaultValue;

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = useMemo(() => cn(cx(), className), [className]);

    const { FormContext, FormRegister } = useHookComponent('ReactiumUI');

    const Form = React.useContext(FormContext);

    const refs = useRefs({ items: {} });

    const [status, setStatus, isStatus] = useStatus('pending');

    const [, setEmpty, isEmpty] = useStatus(false);

    const [, setInit, isInit] = useStatus(false);

    const state = useSyncState({
        data: initialData,
        editable,
        labelField,
        maxResults,
        results: initialData,
        search: null,
        valueField,
        visible: false,
        selected: {},
        previous: {},
        value: initialValue || '',
    });

    const results = useMemo(() => {
        let { data, results: r, labelField, value, valueField } = state.get();
        r = r || [];
        data = data || [];

        const sel = _.findWhere(data, { [valueField]: value }) || {};

        r = _.sortBy(r, labelField).filter(item =>
            Boolean(sel[valueField] !== item[valueField]),
        );

        if (Object.keys(sel).length > 0) r.splice(0, 0, sel);

        return r;
    }, [state.get('results')]);

    const isContainer = useIsContainer();

    const dispatch = useDispatcher({
        state,
        props: { ...props, onChange, onSearch, onSelect },
    });

    const clear = () => {
        state.set({
            value: null,
            selected: {},
            search: null,
            previous: {},
        });

        search('');

        const input = refs.get('input');
        if (!input) return;
        input.value = '';

        return state;
    };

    const createIndex = () => {
        const data = state.get('data', []);
        if (data.length < 1) return;

        const idx = LUNR(lunr => {
            lunr.ref(state.get('valueField'));
            lunr.field(state.get('labelField'));

            data.forEach(item => lunr.add(item));
        });

        const max = Math.max(1, state.get('maxResults'));
        state.set('results', Array.from(data).slice(0, max), false);
        refs.set('index', idx);
    };

    const findInput = () => {
        const container = refs.get('container');
        const input =
            container.querySelector('[data-typeahead]') ||
            container.querySelector('input');

        refs.set('input', input);
    };

    const hide = () => {
        state.set('visible', false);
    };

    const show = () => state.set('visible', true);

    const dismiss = () => {
        hide();
        const input = refs.get('input');
        if (!input) return;
        input.blur();
    };

    const isVisible = () => state.get('visible');

    const search = s => {
        if (!isInit(true)) return;

        let { data, valueField } = state.get();
        data = data || [];

        state.set('search', s, false);

        const idx = refs.get('index');
        if (!idx) return;

        const dataset = _.indexBy(data, valueField);

        const hasSearch = !Boolean(!s || String(s).length < 1);

        const results = hasSearch
            ? idx.search(`*${s}*`).map(i => op.get(dataset, i.ref))
            : Object.values(dataset);

        state.set('results', results);

        return results;
    };

    const select = (item, focus = false) => {
        if (!item) return clear();

        const data = state.get('data');
        if (data.length < 1) return state;

        setStatus('defer');
        state.set('previous', state.get('selected'), false);
        state.set('value', null, false);

        if (!item) {
            state.set('selected', null, false);
            state.set('selected', {});
        } else {
            state.set('selected', item);
        }

        const input = refs.get('input');
        const value = op.get(item, valueField);
        const previous = op.get(state.get('previous'), valueField);

        if (input && Form && props.name && previous !== value) {
            Form.dispatch('input', {
                element: input,
                detail: { item, target: state, type: 'select' },
            });

            if (!Form.controlled) {
                Form.setValue(props.name, value);
            } else {
                const prev = { ...Form.value };

                op.set(Form.value, props.name, value);
                const values = { ...Form.value };

                Form.value = values;

                Form.dispatch('change', {
                    detail: {
                        changed: {
                            field: props.name,
                            value,
                        },
                        previous: prev,
                        value: values,
                    },
                });
            }
        }

        if (input && focus === true) {
            input.focus();
        } else {
            _.defer(hide);
        }

        return state;
    };

    const setData = value => state.set('data', value);

    const setValue = value => {
        if (state.get('value') === value) return;

        const v = state.get('valueField');
        const l = state.get('labelField');

        const item = _.findWhere(state.get('data'), { [v]: value });

        if (!item) return;

        state.value = value;
        state.set('value', value, false);

        state.set('selected', item);

        const input = refs.get('input');
        if (input) {
            let label = op.get(item, l);
            if (label) {
                input.value = label;
            }

            if (props.name && !Form.controlled) {
                Form.setValue(props.name, item[valueField]);
            }
        }
    };

    const update = () => {
        state.set('updated', Date.now());
    };

    const _isActive = item =>
        Boolean(op.get(item, state.get('valueField')) === state.get('value'));

    const _isEditable = () => state.get('editable');

    const _onButtonKeydown = e => {
        const key = String(e.key).toLowerCase();

        if (String(key).length < 2) return;

        e.preventDefault();

        /* prettier-ignore */
        let index = String(e.target.tagName).toLowerCase() === 'button'
                ? Number(e.target.getAttribute('data-index'))
                : -1;

        if (key !== 'enter') {
            index += key === 'arrowup' ? -1 : 1;
            if (index >= Object.keys(refs.get('items')).length) return;
        }

        /* prettier-ignore */
        const elm = index < 0 ? refs.get('input') : refs.get(`items.${String(index)}`);
        if (!elm) return;

        if (key !== 'enter') {
            elm.focus();
        } else {
            const dataset = state.get('data', []);
            const field = state.get('valueField');
            const value = elm.getAttribute('data-value');
            const item = _.findWhere(dataset, { [field]: value });
            select(item);
        }
    };

    const _onDismiss = e => {
        const container = refs.get('container');
        if (isContainer(e.target, container)) return;
        dismiss();
    };

    const _onFocus = () => {
        if (isStatus('defer')) return;
        setStatus('ready');
    };

    const _onKeydown = e => {
        const key = String(e.key).toLowerCase();

        if (String(key).length < 2) return;

        switch (key) {
            case 'arrowdown':
                _onButtonKeydown(e);
                e.preventDefault();
                break;

            case 'enter':
                e.preventDefault();
                break;

            case 'escape':
                dismiss();
                e.preventDefault();
                break;
        }
    };

    const _onKeyup = e => {
        const key = String(e.key).toLowerCase();

        if (String(key).length < 2) return;

        if (_isEditable()) {
            state.set('value', e.target.value, false);
        }
        state.set('selected', null, false);
        search(e.target.value);
        show();
    };

    const _onMouseDown = () => show();

    const _onSearch = () => {
        const s = state.get('search');
        if (!s) return;
        search(s);
    };

    const _onSelect = item => () => select(item);

    const _onShow = () => {
        const { data, value, valueField } = state.get();

        const list = refs.get('list');
        const item = _.findWhere(data, { [valueField]: value });

        if (!list || !item) return;
    };

    const _renderItemFunction = (item, index) => {
        refs.set('items', null);
        refs.set('items', {});

        const value = op.get(item, state.get('valueField'));

        return _.isFunction(renderItemFunction) ? (
            renderItemFunction({ index, item, props, state, value })
        ) : (
            <div
                className={cx('results-item')}
                key={`item-${index}-${value}`}
                ref={elm => refs.set('list', elm)}>
                <button
                    type='button'
                    data-index={index}
                    data-value={value}
                    onMouseDown={_onSelect(item)}
                    onKeyDown={_onButtonKeydown}
                    className={cn({ active: _isActive(item) })}
                    ref={elm => refs.set(`items.${String(index)}`, elm)}
                    children={op.get(item, state.get('labelField'))}
                />
            </div>
        );
    };

    state.refs = refs;
    state.status = status;

    state.extend('hide', hide);
    state.extend('show', show);
    state.extend('clear', clear);
    state.extend('search', search);
    state.extend('select', select);
    state.extend('setData', setData);

    useImperativeHandle(ref, () => state);

    useLayoutEffect(() => {
        if (!refs.get('input')) findInput();
        if (!refs.get('input') && !isEmpty(true)) {
            setEmpty(true, true);
        }
        if (!isInit(true)) setInit(true, true);
    }, [refs.get('input')]);

    useEffect(() => {
        const input = refs.get('input');
        if (!input) return;

        state.addEventListener('show', _onShow);
        input.addEventListener('keyup', _onKeyup);
        input.addEventListener('keydown', _onKeydown);
        input.addEventListener('click', _onFocus);
        input.addEventListener('focus', _onFocus);
        input.addEventListener('mousedown', _onMouseDown);
        input.addEventListener('touchstart', _onMouseDown);

        if (window) {
            window.addEventListener('mouseup', _onDismiss);
            window.addEventListener('keyup', _onDismiss);
        }

        return () => {
            state.removeEventListener('show', _onShow);
            input.removeEventListener('keyup', _onKeyup);
            input.removeEventListener('keydown', _onKeydown);
            input.removeEventListener('click', _onFocus);
            input.removeEventListener('focus', _onFocus);
            input.removeEventListener('mousedown', _onMouseDown);
            input.removeEventListener('touchstart', _onMouseDown);

            if (window) {
                window.removeEventListener('mouseup', _onDismiss);
                window.removeEventListener('keyup', _onDismiss);
            }
        };
    }, [refs.get('input')]);

    useEffect(() => {
        let data = state.get('data');
        data = _.isArray(data) ? data : [];

        const input = refs.get('input');
        if (!input) return;
        if (!isStatus('ready') && data.length > 0) setStatus('ready', true);
    }, [status, refs.get('input')]);

    useEffect(_onSearch, [state.get('search')]);

    useEffect(() => {
        let data = initialData;
        data = _.isArray(data) ? data : [];

        const key = state.get('valueField');
        const current = _.pluck(state.get('data', []), key).sort();
        const newData = _.pluck(data, key).sort();
        if (_.isEqual(current, newData)) return;

        state.set({ data, results: data });
    }, [initialData]);

    useEffect(createIndex, [state.get('data')]);

    useEffect(() => {
        let data = state.get('data');
        data = _.isArray(data) ? data : [];

        state.value = state.get('value');
        dispatch('change');

        const item = _.findWhere(data, { [labelField]: state.value });
        if (!item) return;
        select(item);
    }, [state.get('value')]);

    useEffect(() => {
        const input = refs.get('input');
        const item = state.get('selected');
        if (!item || Object.keys(item).length < 1) return;

        const field = state.get('valueField');
        const lfield = state.get('labelField');

        const label = op.get(item, lfield);
        const value = op.get(item, field);
        const previous = state.get(['previous', field]);

        if (value !== previous) {
            state.set('search', label, false);
            state.set('previous', item, false);
            dispatch('select', { item });
        }

        setValue(value);
        hide();

        if (input && label) {
            input.value = label;
        }
    }, [state.get('selected')]);

    useEffect(() => {
        state.status = status;
        dispatch('status', { status });
    }, [status]);

    useEffect(() => {
        if (!props.name) return;
        if (isStatus('ready')) return;

        const selected = state.get('selected', {}) || {};
        if (Object.keys(selected).length > 0) return;

        let val = initialValue;
        val = !val ? op.get(Form.value, props.name) : val;

        if (val) {
            const item = _.findWhere(initialData, { [valueField]: val });
            if (item) select(item);
        } else {
            select();
        }
    }, [status, initialData, initialValue]);

    useEffect(() => {
        state.value = state.get('value');
        update();
    }, [state.get('value')]);

    useEffect(() => {
        state.selected = state.get('selected');
        update();
    }, [state.get('selected')]);

    useEffect(() => {
        if (isVisible()) {
            dispatch('show');
        } else {
            dispatch('hide');
        }
    }, [state.get('visible')]);

    useEffect(() => {
        let data = state.get('data');
        data = _.isArray(data) ? data : [];

        if (!Form || !op.get(props, 'name') || !data) return;
        const value = op.get(Form.value, props.name);
        setValue(value);
    }, [Form, props.name]);

    return (
        <div
            className={cname}
            style={containerStyle}
            ref={elm => refs.set('container', elm)}>
            {isEmpty(true) ? (
                <FormRegister>
                    <input type='text' {...props} />
                </FormRegister>
            ) : (
                children
            )}
            {isVisible() && (
                <div className={cx('results')}>
                    {results.map(_renderItemFunction)}
                </div>
            )}
        </div>
    );
};

Typeahead = forwardRef(Typeahead);

Typeahead.propTypes = {
    containerStyle: PropTypes.object,
    data: PropTypes.array,
    defaultValue: PropTypes.any,
    editable: PropTypes.bool,
    labelField: PropTypes.string,
    maxResults: PropTypes.number,
    namespace: PropTypes.string,
    renderItemFunction: PropTypes.func,
    style: PropTypes.object,
    value: PropTypes.any,
    valueField: PropTypes.string,
};

Typeahead.defaultProps = {
    containerStyle: {},
    editable: true,
    maxResults: 10,
    namespace: 'typeahead',
    labelField: 'name',
    valueField: 'objectId',
};

export { Typeahead };
