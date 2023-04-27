import _ from 'underscore';
import op from 'object-path';
import React, { useState } from 'react';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';
import { __, useHookComponent } from 'reactium-core/sdk';

export const Checklist = props => {
    const { add, cx, fieldName, remove, showEditor, state } = props;
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
