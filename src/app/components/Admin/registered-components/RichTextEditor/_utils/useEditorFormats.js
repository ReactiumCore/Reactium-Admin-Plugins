import { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default formats => useState(formats || Reactium.RTE.formats);
