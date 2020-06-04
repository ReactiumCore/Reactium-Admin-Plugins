import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const STATUS = {
    PENDING: 'PENDING',
    FETCHING: 'FETCHING',
    READY: 'READY',
};

export const Checklist = props => {
    const inputRef = useRef();
    const { add, cx, fieldName, namespace, remove, showEditor, state } = props;
    const { Button, Checkbox, Icon } = useHookComponent('ReactiumUI');

    const [taxonomy, setTaxonomy] = useState(state.taxonomy);

    const search = txt => {
        txt = _.isEmpty(_.compact([txt])) ? null : String(txt).toLowerCase();
        if (!txt) {
            inputRef.current.value = '';
            inputRef.current.focus();
            setTaxonomy(state.taxonomy);
        } else {
            setTaxonomy(
                Array.from(state.taxonomy).filter(({ name }) => {
                    return String(name)
                        .toLowerCase()
                        .includes(txt);
                }),
            );
        }
    };

    const onChange = e => {
        const checked = e.target.checked;
        const slug = e.target.value;

        const item = _.findWhere(taxonomy, { slug });

        console.log('onChange', checked, slug, item);
        if (!item) return;

        if (checked) add(item);
        else remove(item);
    };

    const slugs = _.pluck(op.get(state, 'selected', []), 'slug');

    return (
        <>
            {state.taxonomy.legnth > 7 && (
                <div className={cx('checklist-search')}>
                    <input
                        type='text'
                        ref={inputRef}
                        placeholder={__('search')}
                        onChange={({ target }) => search(target.value)}
                    />
                    {taxonomy.length < state.taxonomy.length && (
                        <Button
                            onClick={() => search()}
                            color={Button.ENUMS.COLOR.DANGER}
                            appearance={Button.ENUMS.APPEARANCE.CIRCLE}>
                            <Icon name='Feather.X' size={16} />
                        </Button>
                    )}
                </div>
            )}
            <div className={cx('checklist-container')}>
                <Scrollbars>
                    <ul className={cx('checklist')}>
                        {taxonomy.map(({ name, slug }, i) => (
                            <li key={`${slug}-${i}`}>
                                <Checkbox
                                    defaultChecked={slugs.includes(slug)}
                                    label={name}
                                    labelAlign='right'
                                    onChange={onChange}
                                    value={slug}
                                />
                            </li>
                        ))}
                    </ul>
                </Scrollbars>
            </div>
            <div className='footer'>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    color={Button.ENUMS.COLOR.TERTIARY}
                    onClick={() => showEditor()}
                    outline
                    size={Button.ENUMS.SIZE.SM}>
                    <Icon name='Feather.Plus' size={16} className='mr-xs-8' />
                    {__('Add %name').replace(/\%name/gi, fieldName)}
                </Button>
            </div>
        </>
    );
};

export const Tagbox = props => {
    const { cx, namespace, placeholder, state } = props;
    const { TagsInput } = useHookComponent('ReactiumUI');

    return (
        <div className={cx('tagbox')}>
            <TagsInput placeholder={placeholder} />
        </div>
    );
};

const Input = ({ inputType: type, ...props }) => {
    const Component = useHookComponent(type, () => null);
    return <Component {...props} />;
};

export const ContentEditor = ({ namespace = 'editor-taxonomy', ...props }) => {
    const { Alert, Button, Carousel, Icon, Slide, Toast } = useHookComponent(
        'ReactiumUI',
    );
    const ElementDialog = useHookComponent('ElementDialog');
    const TaxonomyEditor = useHookComponent('TaxonomyEditor');

    const {
        editor,
        fieldName,
        inputType,
        placeholder,
        required,
        taxonomy: type,
    } = props;

    const refs = useRef({ status: STATUS.PENDING }).current;

    const [state, update] = useDerivedState({
        taxonomy: [],
        selected: [],
    });

    const setState = newState => {
        if (editor.unMounted()) return;
        update(newState);
    };

    const setStatus = newStatus => {
        if (editor.unMounted()) return;
        refs.status = newStatus;
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const fetch = async () => {
        const { taxonomies = {} } = await Reactium.Taxonomy.Type.retrieve({
            slug: type,
        });

        return _.sortBy(
            Object.values(
                op.get(taxonomies, 'results', {}),
            ).map(({ name, objectId, slug }) => ({ name, objectId, slug })),
            'name',
        );
    };

    const load = async () => {
        if (refs.status !== STATUS.PENDING || !editor) return;
        setStatus(STATUS.FETCHING);
        const [taxonomy] = await Promise.all([fetch()]);

        const slugs = _.pluck(op.get(editor.value, fieldName, []), 'slug');
        const selected = taxonomy.filter(({ slug }) => slugs.includes(slug));

        setStatus(STATUS.READY);
        setState({ selected, taxonomy });
    };

    const isStatus = (...args) => {
        args = Array.from(args);
        return args.includes(refs.status);
    };

    const add = item => {
        op.del(item, 'deleted');
        op.set(item, 'pending', true);
        updateSelected(item);
    };

    const remove = item => {
        op.set(item, 'deleted', true);
        op.set(item, 'pending', true);
        updateSelected(item);
    };

    const updateSelected = item => {
        let selected = state.selected || [];

        const idx = _.findIndex(selected, { slug: item.slug });
        if (idx >= 0) selected.splice(idx, 1, item);
        else selected.push(item);

        setState({ selected });
    };

    const showEditor = () => {
        refs.carousel.next();
    };

    const submitTaxonomy = async () => refs.taxEditor.submit();

    const onSave = e => {
        const { taxonomy } = state;
        const { name, slug } = e.value;
        const item = { name, slug };

        add(item);

        taxonomy.push(item);
        setState({ taxonomy });

        _.defer(() => refs.carousel.next());
    };

    const onSaveSuccess = e => {
        const { name, objectId, slug } = e.result;
        const item = { name, objectId, slug };
        add(item);
    };

    const _handle = () => ({
        add,
        cx,
        editor,
        fieldName,
        isStatus,
        namespace,
        placeholder,
        refs,
        remove,
        required,
        showEditor,
        setState,
        state,
        type,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useEffect(() => {
        if (!editor) return;
        handle['editor'] = editor;
        setHandle(handle);
    }, [editor]);

    useEffect(() => {
        if (!refs.taxEditor) return;
        refs.taxEditor.addEventListener('taxonomy-save', onSave);
        refs.taxEditor.addEventListener('taxonomy-saved', onSaveSuccess);

        return () => {
            refs.taxEditor.removeEventListener('taxonomy-save', onSave);
            refs.taxEditor.removeEventListener('taxonomy-saved', onSaveSuccess);
        };
    });

    useAsyncEffect(load, [editor]);

    return (
        <ElementDialog {...props} className={cx()}>
            <Carousel
                animationSpeed={0.25}
                loop
                ref={elm => op.set(refs, 'carousel', elm)}>
                <Slide>
                    {isStatus(STATUS.READY) && (
                        <Input {...handle} inputType={inputType} />
                    )}
                </Slide>
                <Slide className='editor'>
                    <TaxonomyEditor
                        ref={elm => op.set(refs, 'taxEditor', elm)}
                        type={type}
                        className='flex-grow p-xs-20'
                    />
                    <div className='footer'>
                        <Button
                            appearance={Button.ENUMS.APPEARANCE.PILL}
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={() => submitTaxonomy()}
                            outline
                            size={Button.ENUMS.SIZE.SM}>
                            <Icon
                                name='Feather.Check'
                                size={16}
                                className='mr-xs-8'
                            />
                            {__('Save %name').replace(/\%name/gi, fieldName)}
                        </Button>
                        <Button
                            className='back-btn'
                            appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                            color={Button.ENUMS.COLOR.CLEAR}
                            onClick={() => refs.carousel.prev()}>
                            <Icon name='Feather.ChevronLeft' />
                        </Button>
                    </div>
                </Slide>
            </Carousel>
        </ElementDialog>
    );
};
