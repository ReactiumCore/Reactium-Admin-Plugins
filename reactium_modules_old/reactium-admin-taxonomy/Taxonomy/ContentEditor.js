export * from './Tagbox';
export * from './Checklist';

import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useStatus,
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

    const [, setStatus, isStatus] = useStatus(STATUS.PENDING);

    const cx = Reactium.Utils.cxFactory(namespace);

    const fetch = async () => {
        const { taxonomies = {} } = await Reactium.Taxonomy.Type.retrieve({
            slug: type,
            verbose: true,
        });

        const tax = _.sortBy(
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

        return tax;
    };

    const load = async () => {
        reset();

        if (!isStatus(STATUS.PENDING) || !editor) return;

        setStatus(STATUS.FETCHING);
        const [taxonomy] = await Promise.all([fetch()]);

        const slugs = _.pluck(op.get(editor.value, fieldName, []), 'slug');
        const selected = taxonomy.filter(({ slug }) => slugs.includes(slug));

        // cache this data so other plugins can use it
        Reactium.Cache.set(`editor.taxonomy.${type}.types`, taxonomy);
        Reactium.Cache.set(`editor.taxonomy.${type}.selected`, selected);

        setStatus(STATUS.READY);
        setState({ selected, taxonomy });
        editor.setDirty();
    };

    const reset = () => {
        if (!editor.isNew()) return;
        Reactium.Cache.del('editor.taxonomy');
        setStatus(STATUS.PENDING);
        setState({ taxonomy: [], selected: [] });
    };

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
        if (idx >= 0) {
            selected.splice(idx, 1, item);
        } else {
            selected.push(item);
        }

        const slugs = _.pluck(selected, 'slug');

        // cache selected so other plugins can use it.
        Reactium.Cache.set(`editor.taxonomy.${type}.selected`, selected);

        setState({ selected, slugs });
        editor.setDirty();
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

    const onContentAfterSave = () => {
        let { selected = [] } = state;

        // clear pending
        selected.forEach(item => op.del(item, 'pending'));

        // clear deleted
        selected = selected.filter(({ deleted }) => deleted !== true);

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
        editor.addEventListener('content-parse', onContentBeforeSave);

        return () => {
            editor.removeEventListener('validate', onContentValidate);
            editor.removeEventListener('save-success', onContentAfterSave);
            editor.removeEventListener('content-parse', onContentBeforeSave);
        };
    };

    const onTaxonomySave = e => {
        const { taxonomy } = state;
        const { name, slug } = e.value;
        const item = { name, slug };

        add(item);

        taxonomy.push(item);
        setState({ taxonomy });

        Reactium.Cache.set(`editor.taxonomy.${type}.types`, taxonomy);
        editor.setDirty();
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

    // update handle
    useEffect(() => {
        if (!editor) return;
        handle['editor'] = editor;
        setHandle(handle);
    }, [editor, state.taxonomy]);

    // listeners
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

    // on reset
    //useEffect(reset, [op.get(editor, 'value.objectId')]);

    // data load
    useAsyncEffect(load, [op.get(editor, 'value.objectId')]);

    // on content save
    useEffect(onContentSave);

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
