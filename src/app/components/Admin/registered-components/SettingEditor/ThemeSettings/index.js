import _ from 'underscore';
import op from 'object-path';
import useNavs from './useNavs';
import React, { useEffect } from 'react';
import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

import ColorSelect from './ColorSelect';
import NavSelect from './NavSelect';

const ThemeSettings = props => {
    const [navs] = useNavs();
    const { form, groupName, value } = props;

    const { Tabs } = useHookComponent('ReactiumUI');

    const [state, setState] = useDerivedState({
        active: 0,
        theme: null,
        value,
    });

    const colors = () => op.get(state, 'theme.colors', []);

    const swatches = () => op.get(state, 'theme.swatches', []);

    const navigations = () => op.get(state, 'theme.navigation', []);

    const prefix = (suffix, sep = '.') => `${groupName}${sep}${suffix}`;

    // prettier-ignore
    const setTheme = id => setState({ theme: _.findWhere(Reactium.Theme.list, { id }) });

    const _onThemeSelect = e => setTheme(e.target.value);

    // set state.theme from form value
    useEffect(() => {
        setTheme(op.get(value, prefix('theme')));
    }, [op.get(value, prefix('theme'))]);

    const Navigation = () => (
        <div className='pt-xs-20 pl-xs-20'>
            {navigations().map(({ id, ...nav }) => {
                const name = prefix(`navigation.${id}`);
                return (
                    <NavSelect
                        {...nav}
                        id={id}
                        key={id}
                        name={name}
                        options={navs}
                        value={op.get(state.value, name)}
                    />
                );
            })}
        </div>
    );

    const Color = () => (
        <div className='pt-xs-20 pl-xs-20'>
            {colors().map(({ id, ...color }) => {
                const name = prefix(`color.${id}`);
                return (
                    <ColorSelect
                        {...color}
                        id={id}
                        key={id}
                        name={name}
                        options={swatches()}
                        value={op.get(state.value, name, color.defaultValue)}
                    />
                );
            })}
        </div>
    );

    const Sections = () => {
        const data = !state.theme
            ? []
            : state.theme.tabs.map(({ id, tab, content }) => {
                  switch (id) {
                      case 'navigation':
                          content = <Navigation />;
                          break;

                      case 'color':
                          content = <Color />;
                          break;

                      default:
                          content = content || tab;
                  }

                  return {
                      id,
                      tab,
                      content,
                  };
              });

        const _onChange = ({ activeTab: active }) => {
            form.setValue(form.getValue());
            setState({ active });
        };

        return !state.theme ? null : (
            <Tabs
                activeTab={state.active}
                collapsible
                data={data}
                onChange={_onChange}
            />
        );
    };

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
                        onChange={_onThemeSelect}
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
            <Sections />
        </>
    );
};

export { ColorSelect, NavSelect, ThemeSettings, ThemeSettings as default };
