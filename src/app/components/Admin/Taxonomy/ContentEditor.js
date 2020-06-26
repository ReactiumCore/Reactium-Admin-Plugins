import _ from 'underscore';
import op from 'object-path';
import slugify from 'slugify';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { useEffect, useRef, useState } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const STATUS = {
    PENDING: 'PENDING',
    FETCHING: 'FETCHING',
    READY: 'READY',
};

export const ContentEditor = ({ namespace = 'editor-taxonomy', ...props }) => {
    const { Button, Carousel, Icon, Slide } = useHookComponent('ReactiumUI');
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
            verbos: true,
        });

        return _.sortBy(
            Object.values(op.get(taxonomies, 'results', {}))
                .map(item => (op.has(item, 'id') ? item.toJSON() : item))
                .map(({ name, objectId, slug }) => ({
                    type: fieldName,
                    isTaxonomy: true,
                    name,
                    objectId,
                    slug,
                })),
            'name',
        );
    };

    const load = async () => {
        if (refs.status !== STATUS.PENDING || !editor) return;
        setStatus(STATUS.FETCHING);
        const [taxonomy] = await Promise.all([fetch()]);

        setStatus(STATUS.READY);
        setState({ taxonomy });
    };

    const isStatus = (...args) => Array.from(args).includes(refs.status);

    const add = async (item, create = false) => {
        op.del(item, 'deleted');
        op.set(item, 'pending', true);
        op.set(item, 'isTaxonomy', true);
        op.set(item, 'field', fieldName);
        op.set(item, 'type', type);
        updateSelected(item);

        if (create === true) {
            const { name, slug } = item;
            await Reactium.Taxonomy.create({ slug, name, type });
        }

        return item;
    };

    const remove = item => {
        op.set(item, 'deleted', true);
        op.set(item, 'pending', true);
        op.set(item, 'isTaxonomy', true);
        op.set(item, 'field', fieldName);
        op.set(item, 'type', type);
        updateSelected(item);
        return item;
    };

    const updateSelected = item => {
        let selected = state.selected || [];

        const idx = _.findIndex(selected, { slug: item.slug });
        if (idx >= 0) selected.splice(idx, 1, item);
        else selected.push(item);

        editor.setValue({ [fieldName]: selected });
    };

    const hideEditor = () => {
        refs.carousel.prev();
        refs.taxEditor.clear();
    };

    const showEditor = () => {
        refs.carousel.next();
    };

    const submitTaxonomy = () => refs.taxEditor.submit();

    const onContentBeforeSave = ({ value }) => {
        let { selected = [] } = state;
        if (selected.length < 1) return;

        op.set(value, fieldName, selected);
        op.set(value, 'forceUpdate', true);
    };

    const onContentAfterSave = ({ value }) => {
        console.log('onContentAfterSave', value);
        // let { selected = [] } = state;
        //
        // // clear pending
        // selected.forEach(item => op.del(item, 'pending'));
        //
        // // clear deleted
        // selected = selected.filter(({ deleted }) => deleted !== true);

        const selected = op.get(value, [fieldName]);
        console.log(selected);

        setState({ selected });
    };

    const onContentValidate = ({ context }) => {
        let { selected } = state;
        selected = selected.filter(({ deleted }) => deleted !== true);

        if (selected.length > 0 || !required) return context;

        const err = {
            field: fieldName,
            message: __('%name is a required parameter').replace(
                /\%name/gi,
                fieldName,
            ),
            value: selected,
        };

        context.error[fieldName] = err;
        context.valid = false;

        return context;
    };

    const onContentSave = () => {
        if (!editor) return;

        editor.addEventListener('validate', onContentValidate);
        editor.addEventListener('save-success', onContentAfterSave);
        editor.addEventListener('before-save', onContentBeforeSave);

        return () => {
            editor.removeEventListener('validate', onContentValidate);
            editor.removeEventListener('save-success', onContentAfterSave);
            editor.removeEventListener('before-save', onContentBeforeSave);
        };
    };

    const onTaxonomySave = e => {
        const { taxonomy } = state;
        const { name, slug } = e.value;
        const item = { name, slug };

        add(item);

        taxonomy.push(item);
        setState({ taxonomy });

        _.defer(() => refs.carousel.next());
    };

    const onTaxonomySaveSuccess = e => {
        const { name, objectId, slug } = e.result;
        const item = { name, objectId, slug };
        add(item);
    };

    const _handle = () => ({
        add,
        cx,
        editor,
        fieldName,
        hideEditor,
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
        refs.taxEditor.addEventListener('taxonomy-save', onTaxonomySave);
        refs.taxEditor.addEventListener(
            'taxonomy-saved',
            onTaxonomySaveSuccess,
        );

        return () => {
            refs.taxEditor.removeEventListener('taxonomy-save', onTaxonomySave);
            refs.taxEditor.removeEventListener(
                'taxonomy-saved',
                onTaxonomySaveSuccess,
            );
        };
    });

    useAsyncEffect(load, [editor]);

    useEffect(onContentSave, [editor]);

    useEffect(() => {
        if (!editor) return;
        const { taxonomy } = state;
        const slugs = _.pluck(op.get(editor.value, fieldName, []), 'slug');
        const selected = taxonomy.filter(({ slug }) => slugs.includes(slug));
        if (!_.isEqual(selected, state.selected)) setState({ selected });
    });

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
                            onClick={() => hideEditor()}>
                            <Icon name='Feather.ChevronLeft' />
                        </Button>
                    </div>
                </Slide>
            </Carousel>
        </ElementDialog>
    );
};

const Input = ({ inputType: type, ...props }) => {
    const Component = useHookComponent(type, () => null);
    return <Component {...props} />;
};

export const Checklist = props => {
    const { add, cx, editor, fieldName, remove, showEditor, state } = props;
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
        const checked = e.currentTarget.checked;
        const slug = e.currentTarget.value;

        const item = _.findWhere(taxonomy, { slug });

        if (!item) return;

        if (checked) {
            add(item);
        } else {
            remove(item);
        }
    };

    const slugs = _.pluck(op.get(editor.value, fieldName, []), 'slug');

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
                        {editor &&
                            editor.slug !== 'new' &&
                            editor.value &&
                            editor.value[fieldName] &&
                            taxonomy.map(({ name, slug }, i) => (
                                <li key={`${slug}-existing-${i}`}>
                                    <Checkbox
                                        defaultChecked={slugs.includes(slug)}
                                        label={name}
                                        labelAlign='right'
                                        onChange={onChange}
                                        value={slug}
                                    />
                                </li>
                            ))}

                        {editor &&
                            editor.slug === 'new' &&
                            taxonomy.map(({ name, slug }, i) => (
                                <li key={`${slug}-new-${i}`}>
                                    <Checkbox
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
    const { add, cx, editor, placeholder, remove, state } = props;

    const formatter = val => {
        if (!val) return val;

        const item = _.findWhere(taxonomy, { slug: slugify(val) });

        if (item) {
            const { name } = item;
            return String(name).toLowerCase();
        }

        return String(val).toLowerCase();
    };

    const { selected = [], taxonomy = [] } = state;

    const { TagsInput } = useHookComponent('ReactiumUI');

    const [data] = useState(
        taxonomy.map(({ slug, name }) => ({
            value: slug,
            label: formatter(name),
        })),
    );

    const [value, setNewValue] = useState(
        _.chain(selected)
            .pluck('slug')
            .uniq()
            .compact()
            .value(),
    );

    const setValue = newValue => {
        if (editor.unMounted()) return;
        setNewValue(newValue);
    };

    const onAdd = ({ item }, create = true) => {
        // create a new taxonomy item if it doesn't exist
        const slug = slugify(item);
        if (create == true && _.findWhere(taxonomy, { slug })) return;

        item = { slug, name: item };

        add(item, create);
    };

    const onChange = e => {
        const val = _.uniq(e.value.map(formatter));

        val.forEach(item => onAdd({ item }, false));

        setValue(val);
    };

    const onRemove = ({ item }) => {
        const tax =
            _.findWhere(taxonomy, { name: item }) ||
            _.findWhere(taxonomy, { slug: item });

        remove(tax);
    };

    const validator = val =>
        !_.uniq(value.map(formatter)).includes(formatter(val));

    useEffect(() => {
        setValue(
            _.chain(selected)
                .pluck('slug')
                .uniq()
                .compact()
                .value(),
        );
    }, [selected]);

    return (
        <div className={cx('tagbox')}>
            <TagsInput
                onAdd={onAdd}
                onChange={onChange}
                onRemove={onRemove}
                data={data}
                formatter={formatter}
                placeholder={placeholder}
                validator={validator}
                value={value || []}
            />
        </div>
    );
};
