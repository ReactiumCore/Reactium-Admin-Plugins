import { useState } from 'react';
import Reactium from 'reactium-core/sdk';

export default blocks => useState(blocks || Reactium.RTE.blocks);
