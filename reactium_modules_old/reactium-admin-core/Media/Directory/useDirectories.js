import _ from 'underscore';
import ENUMS from '../enums';
import { useState } from 'react';
import Reactium, { useAsyncEffect, useStatus } from 'reactium-core/sdk';

const useDirectories = (params = {}) => {
    const [directories, setDirectories] = useState(null);
    const [, setStatus, isStatus] = useStatus(ENUMS.STATUS.INIT);

    useAsyncEffect(async mounted => {
        if (!isStatus(ENUMS.STATUS.INIT)) return;
        setStatus(ENUMS.STATUS.FETCHING);

        let dirs = await Reactium.Cloud.run('directories', params);

        await Reactium.Hook.run('media-directories', dirs);

        if (!mounted()) return;

        setDirectories(_.uniq(dirs));
    }, []);

    return directories;
};

export { useDirectories, useDirectories as default };
