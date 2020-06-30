import React, { useEffect, useState } from 'react';
import _ from 'underscore';
import slugify from 'slugify';
import { useHookComponent } from 'reactium-core/sdk';
import TagsInput from './TagsInput';

export const Tagbox = props => {
    //const { TagsInput } = useHookComponent('ReactiumUI');

    const { add, cx, placeholder, remove, state } = props;

    let { selected, taxonomy = [] } = state;

    const [slugs, setSlugs] = useState([]);

    const data = () =>
        taxonomy.map(({ slug, name }) => ({
            value: slug,
            label: formatter(name),
        }));

    const formatter = val => {
        if (!val) return val;

        const item = _.findWhere(taxonomy, { slug: slugify(val) });

        if (item) {
            const { name } = item;
            return String(name).toLowerCase();
        }

        return String(val).toLowerCase();
    };

    const onAdd = ({ item }) => {
        // create a new taxonomy item if it doesn't exist
        const slug = String(slugify(item)).toLowerCase();
        const create = !_.findWhere(taxonomy, { slug });

        item = { slug, name: item };

        add(item, create);
    };

    const onRemove = ({ item }) => {
        const tax =
            _.findWhere(taxonomy, { name: item }) ||
            _.findWhere(taxonomy, { slug: item });

        _.defer(remove, tax);
    };

    const validator = val => {
        let sel = _.pluck(
            selected.filter(({ deleted }) => deleted !== true),
            'slug',
        );
        return !_.uniq(sel.map(formatter)).includes(formatter(val));
    };

    useEffect(() => {
        const newSlugs = _.pluck(
            selected.map(({ deleted }) => deleted !== true),
            'slug',
        );
        setSlugs(newSlugs);
    }, [selected]);

    return (
        <div className={cx('tagbox')}>
            <TagsInput
                onAdd={onAdd}
                onRemove={onRemove}
                data={data()}
                formatter={formatter}
                placeholder={placeholder}
                validator={validator}
                value={slugs || []}
            />
        </div>
    );
};
