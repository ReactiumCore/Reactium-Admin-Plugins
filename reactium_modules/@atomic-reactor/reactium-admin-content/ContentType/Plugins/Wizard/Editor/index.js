import _ from 'underscore';
import uuid from 'uuid/v4';
import op from 'object-path';
import Sortable from './Sortable';
import React, { useEffect } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHandle,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const defaultValue = () => [
    {
        id: uuid(),
        title: '',
        icon: 'Linear.Star',
        content: {
            type: 'div',
            children: [{ type: 'p', children: [{ text: '' }] }],
        },
        media: null,
    },
];

const excludes = {
    blocks: ['tabs'],
    buttons: ['tabs'],
};

const pickerOptions = {
    maxSelect: 1,
    filters: ['IMAGE'],
    title: __('Featured Image'),
};

const clone = arr => JSON.parse(JSON.stringify(arr));

export const Editor = props => {
    const refs = useRefs({ input: [], container: [] });

    const { editor, fieldName, placeholder } = props;

    const [status, setStatus, isStatus] = useStatus();

    const tools = useHandle('AdminTools');
    const MediaTool = useHookComponent('MediaTool');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const IconPicker = useHookComponent('IconSelect');
    const ElementDialog = useHookComponent('ElementDialog');
    const RichTextEditor = useHookComponent('RichTextEditor');

    const {
        Button,
        Carousel,
        Collapsible,
        Icon,
        Pagination,
        Slide,
    } = useHookComponent('ReactiumUI');

    const [state, setState] = useDerivedState({
        active: 0,
        dialog: refs.get('dialog'),
        expanded: false,
        value: op.get(editor, ['value', fieldName], defaultValue()),
    });

    const add = () => {
        const value = clone(state.value);
        const newItem = _.first(defaultValue());
        value.push(newItem);
        setState({ value });

        if (value.length > 1) {
            _.defer(() => {
                const carousel = refs.get('carousel');
                if (!carousel) return;
                const idx = value.length - 1;
                carousel.jumpTo(idx);
                const input = refs.get(`input.${idx}.title`);
                if (input) _.delay(() => input.focus(), 250);
            });
        }
    };

    const remove = index => {
        setStatus('deleting');
        const value = clone(state.value);

        refs.set(`container.${index}.media`, null);
        value.splice(index, 1);
        setState({ active: 0, value });
    };

    const confirmDelete = index => {
        index = index || state.active;

        const slide = state.value[index];
        if (!slide) return;

        const Modal = op.get(tools, 'Modal');

        const msg = __('Delete slide %slide?').replace(
            /\%slide/gi,
            op.get(slide, 'title', index + 1),
        );

        Modal.show(
            <ConfirmBox
                message={msg}
                title={__('Confirm Delete')}
                onCancel={() => Modal.hide()}
                onConfirm={() => {
                    Modal.hide();
                    remove(index);
                }}
            />,
        );
    };

    const elements = () => {
        return !state.expanded
            ? []
            : [
                  <Button
                      key='add-btn'
                      onClick={add}
                      data-align='left'
                      data-vertical-align='middle'
                      data-tooltip={__('New Slide')}
                      color={Button.ENUMS.COLOR.CLEAR}
                      className='ar-dialog-header-btn'>
                      <Icon name='Feather.Plus' />
                  </Button>,
              ];
    };

    const footer = () => ({
        elements: [
            <Button
                key='move-btn'
                onClick={toggleSortable}
                color={Button.ENUMS.COLOR.CLEAR}
                className='ar-dialog-footer-btn'>
                <Icon name='Linear.Move' />
            </Button>,
            <div className='flex-grow flex right' key='pagination'>
                {state.value.length > 1 && (
                    <Pagination
                        onNextClick={() => nav(1)}
                        onPrevClick={() => nav(-1)}
                        page={state.active + 1}
                        pages={state.value.length}
                    />
                )}
            </div>,
        ],
    });

    const nav = inc => {
        const carousel = refs.get('carousel');
        if (!carousel) return;
        if (inc === 1) carousel.next();
        else carousel.prev();
    };

    const pref = str => {
        const p = op.get(props, 'pref').split('.');
        p.pop();
        p.push(str);
        return p.join('.');
    };

    const setPref = (k, v) => {
        const p = pref(k);
        Reactium.Prefs.set(p, v);
    };

    const toggleIcon = () => {
        const picker = refs.get('icon');
        if (!picker) return;

        const { active, value } = state;
        const icon = op.get(value, [active, 'icon']);
        const dataset = picker.dataset;
        op.set(dataset, 'index', active);
        picker.setState({ dataset, value: icon, visible: true });
    };

    const toggleMedia = () => {
        const cont = refs.get(`container.${state.active}.media`);
        if (!cont) return;
        cont.toggle();
    };

    const toggleSortable = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.show(<Sortable data={state.value} onChange={_onSort} />);
    };

    const _onChange = e => {
        const value = clone(state.value);
        const index = e.target.dataset['index'];
        const name = e.target.dataset['name'];
        op.set(value, [index, name], e.target.value);
        setState({ value });
    };

    const __onChangeRTE = ({ value, index }) => {
        const currentValue = clone(state.value);
        op.set(currentValue, [index, 'content'], value);
        setState({ value: currentValue });
    };

    const _onChangeRTE = _.throttle(__onChangeRTE, 500, { leading: false });

    const _onMediaSelect = selection => {
        selection = selection.filter(item => !item.delete);

        const { active } = state;
        const value = clone(state.value);
        op.set(value, [active, 'media'], selection);
        setState({ value });
    };

    const _onMediaToggle = e => {
        const expanded = e.type === 'expand';

        setPref('media', expanded);

        _.pluck(refs.get('container'), 'media').forEach(elm => {
            if (!elm) return;
            if (expanded) elm.expand();
            else elm.collapse();
        });
    };

    const _onSave = ({ value }) => {
        op.set(value, fieldName, state.value);
    };

    const _onSort = ({ value }) => {
        setStatus('deleting');
        setState({ active: 0, value });
    };

    useEffect(() => {
        const dialog = refs.get('dialog');
        if (!dialog) return;
        setState({ dialog, expanded: dialog.state.expanded });
    }, [refs.get('dialog')]);

    useEffect(() => {
        const { value } = state;
        if (!value) return;
        if (value.length < 1) {
            add();
        }
    }, [state.value]);

    useEffect(() => {
        editor.addEventListener('before-save', _onSave);
        return () => {
            editor.removeEventListener('before-save', _onSave);
        };
    }, [editor]);

    useEffect(() => {
        if (isStatus('deleting')) {
            setStatus('ready', true);
            return;
        }
    }, [status]);

    return (
        <ElementDialog
            {...props}
            footer={footer()}
            elements={elements()}
            title={__('Slides')}
            ref={elm => refs.set('dialog', elm)}
            onExpand={() => setState({ expanded: true })}
            onCollapse={() => setState({ expanded: false })}>
            {!isStatus('deleting') && (
                <Carousel
                    animationSpeed={0.25}
                    startIndex={state.index}
                    ref={elm => refs.set('carousel', elm)}
                    onChange={({ active }) => setState({ active })}>
                    {state.value.map((item, i) => {
                        item.icon = item.icon || 'Linear.Star';
                        item.content = op.get(
                            item,
                            'content',
                            _.first(defaultValue()).content,
                        );

                        return (
                            <Slide key={`wizard-slide-${item.id || i}`}>
                                <div className='wizard-input-container'>
                                    <div className='wizard-input-group'>
                                        <input
                                            type='text'
                                            data-index={i}
                                            data-name='title'
                                            value={item.title}
                                            onChange={_onChange}
                                            placeholder={placeholder.title}
                                            ref={elm =>
                                                refs.set(
                                                    `input.${i}.title`,
                                                    elm,
                                                )
                                            }
                                        />
                                        <div className='btn-group'>
                                            <Button
                                                data-align='left'
                                                data-vertical-align='middle'
                                                onClick={e => toggleIcon(e)}
                                                data-tooltip={__('Select Icon')}
                                                color={
                                                    Button.ENUMS.COLOR.TERTIARY
                                                }>
                                                <Icon
                                                    name={item.icon}
                                                    size={16}
                                                />
                                            </Button>
                                            <Button
                                                data-align='left'
                                                data-vertical-align='middle'
                                                onClick={() => toggleMedia()}
                                                color={
                                                    Button.ENUMS.COLOR.TERTIARY
                                                }
                                                data-tooltip={__(
                                                    'Select Featured Image',
                                                )}>
                                                <Icon
                                                    size={16}
                                                    name='Feather.Image'
                                                />
                                            </Button>
                                            <Button
                                                data-align='left'
                                                data-vertical-align='middle'
                                                onClick={() => confirmDelete(i)}
                                                data-tooltip={__(
                                                    'Delete Slide',
                                                )}
                                                color={
                                                    Button.ENUMS.COLOR.DANGER
                                                }>
                                                <Icon
                                                    name='Feather.X'
                                                    size={20}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <Collapsible
                                    onExpand={e => _onMediaToggle(e)}
                                    onCollapse={e => _onMediaToggle(e)}
                                    ref={elm =>
                                        refs.set(`container.${i}.media`, elm)
                                    }
                                    expanded={Reactium.Prefs.get(
                                        pref('media'),
                                        false,
                                    )}>
                                    <div className='wizard-media'>
                                        <MediaTool
                                            value={item.media}
                                            id={`media-tool-${i}`}
                                            onSelection={_onMediaSelect}
                                            pickerOptions={pickerOptions}
                                            ref={elm =>
                                                refs.set(`media.${i}`, elm)
                                            }
                                        />
                                    </div>
                                </Collapsible>
                                <div className='wizard-rte'>
                                    <RichTextEditor
                                        exclude={excludes}
                                        value={item.content}
                                        onChange={e =>
                                            _onChangeRTE({
                                                value: e.target.value,
                                                index: i,
                                            })
                                        }
                                        placeholder={__('Content')}
                                        ref={elm =>
                                            refs.set(`inputs.${i}.rte`, elm)
                                        }
                                    />
                                </div>
                            </Slide>
                        );
                    })}
                </Carousel>
            )}
            <IconPicker
                data-name='icon'
                onChange={_onChange}
                className='wizard-icon-picker'
                ref={elm => refs.set('icon', elm)}
            />
        </ElementDialog>
    );
};
