import _ from 'underscore';
import React, { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default () =>
    useState(_.pluck(Object.keys(Reactium.RTE.plugins), 'type'));
