import _ from 'underscore';
import slugify from 'slugify';
import React, { useState } from 'react';
import { useHookComponent } from 'reactium-core/sdk';

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
