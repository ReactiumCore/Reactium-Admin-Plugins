import _ from 'underscore';
import React, { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default plugins =>
    useState(_.pluck(Object.keys(plugins || Reactium.RTE.plugins), 'type'));
