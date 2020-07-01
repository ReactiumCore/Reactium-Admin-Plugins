import Reactium from 'reactium-core/sdk';
import camelcase from 'camelcase';
import { useState } from 'react';
import ENUMS from '../enums';
import _ from 'underscore';

export const useMediaFileTypes = () => {
    const getTypes = () => {
        let arr = Object.keys(ENUMS.TYPE).map(type => ({
            label: camelcase(type, { pascalCase: true }),
            value: type,
        }));

        Reactium.Hook.runSync('media-types', arr);
        arr = _.sortBy(arr, 'label');
        return arr;
    };

    return useState(getTypes());
};
