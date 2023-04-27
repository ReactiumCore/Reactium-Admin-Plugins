import _ from 'underscore';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Editor, Range, Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';
import React, { forwardRef, useEffect, useState } from 'react';

import Reactium, {
    __,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const STATUS = {
    PENDING: 'pending',
    FETCHING: 'fetching',
    COMPLETE: 'complete',
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Panel
 * -----------------------------------------------------------------------------
 */

let Panel = (
    {
        removeButtonLabel,
        submitButtonLabel,
        title,
        updateButtonLabel,
        ...props
    },
    ref,
) => {
    const refs = useRefs();

    const editor = useSlate();

    const [selection, setSelection] = useState();

    const activeNode = () => {
        const [results] = Editor.nodes(editor, {
            match: n => n.type === 'link',
        });
        return Array.isArray(results) && results.length > 0
            ? _.first(results)
            : undefined;
    };

    const [node, setNode] = useState(activeNode());

    const [isButton, setButton] = useState(false);

    const [, setStatus, isStatus] = useStatus(STATUS.PENDING);

    const { Button, Dialog, Icon, Spinner, Toggle } = useHookComponent(
        'ReactiumUI',
    );

    // className prefixer
    const cx = cls =>
        _.chain([op.get(props, 'className', op.get(props, 'namespace')), cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const isExpanded = () => selection && !Range.isCollapsed(selection);

    const isLinkActive = () => !!activeNode();

    const fetch = async ({ refresh = false, route }) => {
        if (refresh === true) Reactium.Cache.del('link-lookup');

        let req = Reactium.Cache.get('link-lookup');

        if (req) return req;

        req = new Reactium.Query('Route').matches(
            'route',
            new RegExp(route, 'i'),
        );

        Reactium.Cache.set('link-lookup', req, 2000);

        return req.first().then(response => {
            Reactium.Cache.del('link-lookup');

            if (!response) return null;
            const route = response.get('route');
            const meta = response.get('meta');

            return {
                ...meta,
                route,
            };
        });
    };

    const unMounted = () => !refs.get('container');

    const unwrapLink = () =>
        Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });

    const wrapLink = async params => {
        if (!isExpanded()) return;
        if (isLinkActive()) unwrapLink();

        const href = op.get(params, 'url');
        const button = op.get(params, 'button');
        const target = op.get(params, 'target');
        const className = op.get(params, 'className');
        const node = {
            href,
            button,
            target,
            className,
            content: null,
            type: 'link',
        };

        if (String(href).startsWith('/')) {
            setStatus(STATUS.FETCHING, true);
            const content = await fetch({ route: href });
            if (unMounted()) return;
            setStatus(STATUS.COMPLETE);
            op.set(node, 'content', content);
        }

        Transforms.wrapNodes(editor, node, { split: true, at: selection });

        hide();
    };

    const _onClearLink = () => {
        unwrapLink();
        hide();
    };

    const _onDismiss = () => hide();

    const _onSubmit = e => {
        if (e) e.preventDefault();

        const url = refs.get('url');
        const size = refs.get('size');
        const color = refs.get('color');
        const width = refs.get('width');
        const height = refs.get('height');
        const cls = refs.get('className');
        const target = refs.get('target');
        const outline = refs.get('outline');
        const appearance = refs.get('appearance');

        const button = isButton
            ? {
                  size: size.value,
                  color: color.value,
                  width: width.value,
                  height: height.value,
                  outline: outline.checked ? outline.value : null,
                  appearance: appearance.checked ? appearance.value : null,
              }
            : null;

        wrapLink({
            button,
            url: url.value,
            className: cls.value,
            target: target.value,
        });
    };

    const _onTypeToggle = e => setButton(e.target.checked);

    const hide = () => {
        editor.panel.hide(false, true).setID('rte-panel');
        Transforms.collapse(editor, { edge: 'end' });
        ReactEditor.focus(editor);
    };

    useEffect(() => {
        if (unMounted()) return;
        if (!editor.selection) return;

        if (!_.isEqual(selection, editor.selection)) {
            setSelection(editor.selection);
        }

        const newNode = activeNode();
        if (newNode && isButton !== !!op.get(newNode, 'button')) {
            setButton(!!op.get(newNode, 'button'));
            setNode(newNode);
        }
    }, [selection, editor.selection]);

    // Renderers
    const submitLabel = node ? updateButtonLabel : submitButtonLabel;

    return (
        <div className={cx()} ref={ref}>
            <Dialog
                dismissable
                header={{ title }}
                collapsible={false}
                onDismiss={_onDismiss}
                pref='admin.dialog.formatter'
                ref={elm => refs.set('container', elm)}>
                <Scrollbars autoHeight autoHeightMin={286} autoHeightMax='80vh'>
                    <div className='p-xs-20'>
                        <div className='form-group'>
                            <input
                                data-focus
                                type='text'
                                ref={elm => refs.set('url', elm)}
                                defaultValue={op.get(node, 'href', '')}
                                placeholder={__('http://site.com/page')}
                            />
                            <Icon name='Feather.Link' />
                        </div>
                        <div className='form-group'>
                            <input
                                type='text'
                                placeholder={__('class')}
                                ref={elm => refs.set('className', elm)}
                                defaultValue={op.get(node, 'className', '')}
                            />
                            <Icon name='Feather.Droplet' />
                        </div>
                        <div className='form-group'>
                            <input
                                type='text'
                                placeholder={__('target')}
                                ref={elm => refs.set('target', elm)}
                                defaultValue={op.get(node, 'target', '')}
                            />
                            <Icon name='Feather.Target' />
                        </div>
                        <hr style={{ marginLeft: -20, marginRight: -20 }} />
                        <div className='form-group'>
                            <Toggle
                                checked={isButton}
                                label={__('Button')}
                                onChange={_onTypeToggle}
                            />
                        </div>
                        <ButtonOptions
                            refs={refs}
                            node={node}
                            isButton={isButton}
                        />
                    </div>
                </Scrollbars>
                <hr />
                <div className='p-xs-8'>
                    {node && (
                        <Button
                            block
                            outline
                            size='sm'
                            data-focus
                            type='button'
                            color='danger'
                            className='my-xs-8'
                            onClick={_onClearLink}
                            children={removeButtonLabel}
                            disabled={isStatus(STATUS.FETCHING)}
                        />
                    )}
                    <Button
                        block
                        size='sm'
                        type='button'
                        color='primary'
                        onClick={_onSubmit}
                        children={submitLabel}
                        disabled={isStatus(STATUS.FETCHING)}
                    />
                </div>
                {isStatus(STATUS.FETCHING) && <Spinner />}
            </Dialog>
        </div>
    );
};

const ButtonOptions = ({ isButton, node, refs }) => {
    const [outline, setOutline] = useState(
        op.get(node, 'button.outline', false),
    );
    const [appearance, setAppearance] = useState(
        op.get(node, 'button.appearance', false),
    );

    const { Button, Icon, Toggle } = useHookComponent('ReactiumUI');

    return !isButton ? null : (
        <>
            <hr style={{ marginLeft: -20, marginRight: -20 }} />
            <div className='form-group'>
                <Toggle
                    ref={elm => refs.set('outline', op.get(elm, 'input'))}
                    onChange={e => setOutline(e.target.checked)}
                    label={__('Outline')}
                    checked={outline}
                    value='outline'
                />
            </div>
            <div className='form-group'>
                <Toggle
                    ref={elm => refs.set('appearance', op.get(elm, 'input'))}
                    onChange={e => setAppearance(e.target.checked)}
                    label={__('Rounded')}
                    checked={appearance}
                    value='pill'
                />
            </div>
            <div className='form-group'>
                <select
                    ref={elm => refs.set('size', elm)}
                    defaultValue={op.get(
                        node,
                        'button.size',
                        Button.ENUMS.SIZE.SM,
                    )}>
                    {Object.entries(Button.ENUMS.SIZE).map(([key, value]) => (
                        <option value={value} key={key}>
                            {String(key).toLowerCase()}
                        </option>
                    ))}
                </select>
            </div>
            <div className='form-group'>
                <select
                    ref={elm => refs.set('color', elm)}
                    defaultValue={op.get(
                        node,
                        'button.color',
                        Button.ENUMS.COLOR.PRIMARY,
                    )}>
                    {Object.entries(Button.ENUMS.COLOR).map(([key, value]) => (
                        <option value={value} key={key}>
                            {String(key).toLowerCase()}
                        </option>
                    ))}
                </select>
            </div>
            <div className='form-group'>
                <div
                    className='flex flex-middle'
                    style={{
                        justifyContent: 'space-between',
                        position: 'relative',
                        width: '100%',
                    }}>
                    <input
                        style={{
                            flexGrow: 0,
                            maxWidth: '42%',
                            paddingLeft: 10,
                            textAlign: 'center',
                        }}
                        ref={elm => refs.set('width', elm)}
                        placeholder={__('width')}
                        type='text'
                    />
                    <Icon
                        name='Feather.X'
                        style={{
                            left: '50%',
                            transform: 'translateY(-50%) translateX(-50%)',
                        }}
                    />
                    <input
                        style={{
                            flexGrow: 0,
                            maxWidth: '42%',
                            paddingLeft: 10,
                            textAlign: 'center',
                        }}
                        ref={elm => refs.set('height', elm)}
                        placeholder={__('height')}
                        type='text'
                    />
                </div>
            </div>
        </>
    );
};

Panel = forwardRef(Panel);

Panel.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    removeButtonLabel: PropTypes.node,
    submitButtonLabel: PropTypes.node,
    updateButtonLabel: PropTypes.node,
    title: PropTypes.string,
};

Panel.defaultProps = {
    namespace: 'rte-link-insert',
    removeButtonLabel: __('Remove Link'),
    submitButtonLabel: __('Insert Link'),
    updateButtonLabel: __('Update Link'),
    title: __('Link'),
};

export { Panel as default };
