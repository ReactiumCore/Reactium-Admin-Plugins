import { useEffect, useState } from 'react';
import useDirectories from 'components/Admin/Media/Directory/useDirectories';
import op from 'object-path';
import _ from 'underscore';

const createSetDirectories = (
    directories,
    updateDirectories,
) => newDirectories => {
    if (_.isString(newDirectories)) {
        newDirectories = String(newDirectories)
            .replace(/ /g, '-')
            .replace(/[^a-z0-9\-\_\/]/gi, '')
            .toLowerCase();

        newDirectories = newDirectories.startsWith('/')
            ? newDirectories.substr(1)
            : newDirectories;

        newDirectories = _.flatten([directories, newDirectories]);
    }

    newDirectories = !newDirectories
        ? []
        : _.chain(newDirectories)
              .compact()
              .uniq()
              .value();

    newDirectories.sort();

    updateDirectories(newDirectories);
};

const useDirectoryState = () => {
    const dirs = useDirectories() || [];
    const [directories, updateDirectories] = useState(dirs);
    const setDirectories = createSetDirectories(directories, updateDirectories);

    // update directories
    useEffect(() => {
        if (!dirs) return;
        const newDirectories = _.chain([directories, dirs])
            .flatten()
            .uniq()
            .value();

        if (!_.isEqual(directories, newDirectories)) {
            setDirectories(newDirectories);
        }
    }, [dirs]);

    return [directories, setDirectories];
};

export default useDirectoryState;
