import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';

let _components = {};

const SDK = {};

SDK.list = refresh => {
    return !refresh
        ? _components
        : Reactium.Setting.get('components', {}, refresh).then(results => {
              _components = results;
              return _components;
          });
};

export default SDK;
