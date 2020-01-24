import link from '../_plugins/link';
import RTEPlugin from '../RTEPlugin';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

const plugins = {
    react: new RTEPlugin({ callback: withReact, order: 0 }),
    history: new RTEPlugin({ callback: withHistory, order: 1 }),
    link,
};

export default plugins;
