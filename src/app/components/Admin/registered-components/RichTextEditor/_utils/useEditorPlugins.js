import _ from 'underscore';
import React, { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default () =>
    useState(_.pluck(Object.values(Reactium.RTE.plugins), 'plugin'));
