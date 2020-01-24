import _ from 'underscore';
import React, { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default plugins => useState(plugins || Reactium.RTE.plugins);
