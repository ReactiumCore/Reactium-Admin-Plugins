import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
    useRefs,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: HookComponent
 * -----------------------------------------------------------------------------
 */
const helpText = () =>
    __(
        'Enter the registered component name that this component resolves to when displaying in the Content Editor',
    );

const HookComponent = ({ handle, id }) => {
    // -------------------------------------------------------------------------
    // Props
    // -------------------------------------------------------------------------
    const { cx, editor, namespace } = handle;

    // -------------------------------------------------------------------------
    // Components
    // -------------------------------------------------------------------------
    const {
        Alert,
        Button,
        Collapsible,
        Dropdown,
        EventForm,
        Icon,
    } = useHookComponent('ReactiumUI');

    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, setState] = useDerivedState({
        helpExpanded: Reactium.Prefs.get(`admin.help.${namespace}-type`),
        error: null,
        search: op.get(editor, 'value.component', op.get(editor, 'value.name')),
    });

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------
    const clear = () => {
        setState({ search: null });
        const component = refs.get('component');
        component.value = '';
        component.focus();
    };

    const components = () => {
        const search = state.search;
        const items = _.sortBy(
            Reactium.Component.list.map(({ id }) => ({
                value: id,
                label: id,
            })),
            'value',
        );

        return search
            ? items.filter(({ value }) =>
                  String(value)
                      .toLowerCase()
                      .includes(String(search).toLowerCase()),
              )
            : items;
    };

    const errorMsg = () => op.get(state, 'error.message');

    const header = ({ header: currentHeader, active }) => {
        if (active !== id) return;
        const { elements = [] } = handle.header(true);

        elements.splice(
            0,
            0,
            <Button
                className='ar-dialog-header-btn'
                color={Button.ENUMS.COLOR.CLEAR}
                key='component-type-info'
                onClick={helpToggle}
                style={{ paddingLeft: 2 }}>
                <Icon name='Feather.AlertCircle' />
            </Button>,
        );

        op.set(currentHeader, 'elements', elements);
    };

    const helpToggle = () => {
        const help = refs.get('help');
        if (help) help.toggle();
    };

    const isError = field => Boolean(op.get(state, 'error.field') === field);

    const reset = () => {
        const form = refs.get('form');
        form.setValue(null);
    };

    const validate = value => {
        if (!op.get(value, 'component')) {
            const elm = refs.get('component');
            if (elm) elm.focus();
            return {
                field: 'component',
                message: __('Component is a required parameter'),
            };
        }
    };

    const _onActive = ({ active = 'selector' }) => {
        const form = refs.get('form');
        if (active !== id) {
            reset();
            setState({ error: null, search: null });
            if (form) form.setValue(null);
        } else {
            if (form) form.setValue(editor.value);
        }
    };

    const _onDropdownSelect = ({ item }) => {
        setState({ error: null, search: item.value });
        const form = refs.get('form');
        if (form) form.setValue({ ...editor.value, component: item.value });

        const submit = refs.get('submit');
        if (submit) submit.focus();
    };

    const _onHelpToggle = () => {
        const help = refs.get('help');
        const { expanded } = help.state;
        Reactium.Prefs.set(`admin.help.${namespace}-type`, !expanded);
        setState({ helpExpanded: !expanded });
    };

    const _onSearch = e => setState({ search: e.target.value });

    const _onSubmit = ({ value }) => {
        // validate
        const error = validate(value);

        if (error) {
            setState({ error });
            return;
        }

        const component = op.get(value, 'component');

        setState({ error: null });

        _.defer(() => handle.save({ ...editor.value, type: id, component }));
    };

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    useEffect(() => {
        handle.addEventListener('change', _onActive);
        handle.addEventListener('header', header);

        return () => {
            handle.removeEventListener('change', _onActive);
            handle.removeEventListener('header', header);
        };
    }, [Object.values(editor.value)]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className={cx('hook')}>
            <Collapsible
                expanded={state.helpExpanded}
                onCollapse={_onHelpToggle}
                onExpand={_onHelpToggle}
                ref={elm => refs.set('help', elm)}>
                <div className='help'>
                    <Alert>{helpText()}</Alert>
                </div>
            </Collapsible>
            <EventForm onSubmit={_onSubmit} ref={elm => refs.set('form', elm)}>
                <input
                    type='hidden'
                    ref={elm => refs.set('componentx', elm)}
                    value={state.search || ''}
                />
                <Dropdown
                    collapseEvent='blur'
                    data={components()}
                    expandEvent='focus'
                    onItemSelect={_onDropdownSelect}
                    ref={elm => refs.set('dropdown', elm)}
                    selection={[
                        op.get(
                            editor.value,
                            'component',
                            op.get(editor.value, 'name'),
                        ),
                    ]}
                    size='md'>
                    <div
                        className={cn('form-group', {
                            error: isError('component'),
                        })}>
                        <input
                            data-dropdown-element
                            defaultValue={op.get(
                                editor.value,
                                'component',
                                op.get(editor.value, 'name'),
                            )}
                            onChange={_onSearch}
                            placeholder={__('Component')}
                            ref={elm => refs.set('component', elm)}
                            name='component'
                        />
                        {isError('component') && <small>{errorMsg()}</small>}
                        <Button
                            className='clear-btn'
                            type='button'
                            onClick={clear}
                            color={Button.ENUMS.COLOR.DANGER}>
                            <Icon name='Feather.X' />
                        </Button>
                    </div>
                </Dropdown>
                <div className='submit'>
                    <Button type='submit' ref={elm => refs.set('submit', elm)}>
                        {__('Apply Component Type')}
                    </Button>
                </div>
            </EventForm>
        </div>
    );
};

export default HookComponent;
