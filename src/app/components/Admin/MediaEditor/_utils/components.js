import _ from 'underscore';
import op from 'object-path';
import Reactium, { __ } from 'reactium-core/sdk';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Button, Dropdown, TagsInput } from '@atomic-reactor/reactium-ui';

const noop = () => {};

const Directory = ({ data, label, name, value }) => (
    <div className='form-group'>
        <label>
            {label}
            <select name={name} defaultValue={value}>
                {data &&
                    data.map((item, i) => (
                        <option key={`${name}-${i}`}>{item}</option>
                    ))}
            </select>
        </label>
    </div>
);

const Permissions = forwardRef(({ onChange = noop, value = [] }, ref) => {
    const targets = Reactium.Cache.get('acl-targets');

    if (!targets) return null;

    const [state, setNewState] = useState({
        search: '',
        value,
    });

    const setState = newState =>
        setNewState({
            ...state,
            ...newState,
        });

    const onSearch = e => setState({ search: e.target.value });

    const getData = () => {
        let data = [];
        let { search, value } = state;
        const { roles = [], users = [] } = targets;

        roles.forEach(role => {
            let { objectId, label, name } = role;
            label = label || name;
            const item = { label, value: objectId, type: 'role' };
            data.push(item);
        });

        users.forEach(user => {
            const { objectId, fname, lname, username } = user;
            const fullname = _.compact([fname, lname]).join(' ');
            const label = fullname.length > 0 ? fullname : username;
            const item = { label, value: objectId, type: 'user' };
            data.push(item);
        });

        if (search) {
            search = String(search).toLowerCase();
            data = data.filter(({ label }) => {
                label = String(label).toLowerCase();
                return label.includes(search);
            });
        }

        return data;
    };

    const render = () => {
        const { value } = state;
        return (
            <div>
                <Dropdown
                    collapseEvent='blur'
                    data={getData()}
                    expandEvent={['focus', 'click']}
                    multiSelect
                    onChange={onChange}
                    ref={ref}
                    search={state.search}
                    selection={value}
                    style={{ width: '100%' }}>
                    <div className='form-group mb-xs-0'>
                        <label>
                            {__('Can View')}:
                            <input
                                autoComplete='off'
                                data-dropdown-element
                                onChange={e => onSearch(e)}
                                placeholder={__('Select')}
                                type='text'
                                value={state.search || ''}
                            />
                        </label>
                    </div>
                </Dropdown>
            </div>
        );
    };

    return render();
});

const Tags = forwardRef(({ data = [], onChange = noop }, ref) => (
    <>
        <div className='form-group mb-xs-0'>
            <label>{__('Tags')}:</label>
        </div>
        <TagsInput
            ref={ref}
            placeholder={__('Add tag')}
            name='meta.tags'
            onChange={e => onChange(e)}
        />
    </>
));

export { Directory, Permissions, Tags };
