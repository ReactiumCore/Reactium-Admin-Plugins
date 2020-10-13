import React, { useState } from 'react';
import _ from 'underscore';
import op from 'object-path';
import Reactium, { __, useAsyncEffect, useStatus } from 'reactium-core/sdk';

const useNavs = () => {
    const [data, setData] = useState();

    const [status, setStatus, isStatus] = useStatus('pending');

    const fetch = (page = 1) =>
        Reactium.Content.list({
            type: {
                machineName: 'navigation',
            },
            orderBy: 'title',
            direction: 'ascending',
            refresh: true,
            limit: 1000,
            page,
            status: 'PUBLISHED',
        });

    useAsyncEffect(async () => {
        if (!isStatus('pending')) return;
        setStatus('fetching');

        const temp = [];
        const addTemp = items => items.forEach(item => temp.push(item));

        let fetched = await fetch();
        let { page = 1, pages = 1, results = [] } = fetched;

        addTemp(results);

        while (page < pages) {
            page += 1;
            fetched = await fetch(page);
            let { results = [] } = fetched;
            if (results.length > 0) addTemp(results);
        }

        setStatus('ready');

        await Reactium.Hook.run('settings-nav-list', temp);

        setData(temp);
    }, [status]);

    return [data, setData];
};

const ThemeSettings = props => {
    const [navs] = useNavs();
    const { groupName, value } = props;
    const prefix = (suffix, sep = '.') => `${groupName}${sep}${suffix}`;

    return Reactium.Theme.list.length < 1 ? null : (
        <>
            <div className='ar-dialog-header mx--20'>
                <h2>{__('Theme Settings')}</h2>
            </div>
            <div className='form-group'>
                <label>
                    <span aria-label={__('Theme')}>{__('Theme')}</span>
                    <select
                        name={prefix('theme')}
                        defaultValue={op.get(value, prefix('theme'))}>
                        <option value={null}>Select Theme</option>
                        {Reactium.Theme.list.map(({ id, label }) => (
                            <option key={id} value={id}>
                                {label || id}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <div className='form-group'>
                <label>
                    <span aria-label={__('Header Navigation')}>
                        {__('Header Navigation')}
                    </span>
                    {navs && (
                        <select
                            name={prefix('navigation.header')}
                            defaultValue={op.get(
                                value,
                                prefix('navigation.header'),
                            )}>
                            <option value={null}>Select</option>
                            {navs.map(({ slug, title }) => (
                                <option value={slug} key={slug}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    )}
                </label>
            </div>
            <div className='form-group'>
                <label>
                    <span aria-label={__('Footer Navigation')}>
                        {__('Footer Navigation')}
                    </span>
                    {navs && (
                        <select
                            name={prefix('navigation.footer')}
                            defaultValue={op.get(
                                value,
                                prefix('navigation.footer'),
                            )}>
                            <option value={null}>Select</option>
                            {navs.map(({ slug, title }) => (
                                <option value={slug} key={slug}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    )}
                </label>
            </div>
            <div className='form-group'>
                <label>
                    <span aria-label={__('Social Links')}>
                        {__('Social Links')}
                    </span>
                    {navs && (
                        <select
                            name={prefix('navigation.social')}
                            defaultValue={op.get(
                                value,
                                prefix('navigation.social'),
                            )}>
                            <option value={null}>Select</option>
                            {navs.map(({ slug, title }) => (
                                <option value={slug} key={slug}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    )}
                </label>
            </div>
        </>
    );
};

export { ThemeSettings, ThemeSettings as default };
