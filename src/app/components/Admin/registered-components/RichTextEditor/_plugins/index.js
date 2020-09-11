import RTEPlugin from '../RTEPlugin';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import withBold from './withBold';
import withBlock from './withBlock';
import withColor from './withColor';
import withData from './withData';
import withFont from './withFont';
import withFormatter from './withFormatter';
import withGrid from './withGrid';
import withIcon from './withIcon';
import withLink from './withLink';
import withItalic from './withItalic';
import withList from './withList';
import withMediaImage from './withMediaImage';
import withMediaVideo from './withMediaVideo';
import withStrike from './withStrike';
import withTab from './withTab';
import withUnderline from './withUnderline';

const plugins = {
    withReact: new RTEPlugin({ callback: withReact, order: 0 }),
    withHistory: new RTEPlugin({ callback: withHistory, order: 1 }),
    withData,
    withBold,
    withBlock,
    withColor,
    withFont,
    withFormatter,
    withGrid,
    withIcon,
    withLink,
    withItalic,
    withMediaImage,
    withMediaVideo,
    withList,
    withStrike,
    withTab,
    withUnderline,
};

export { plugins, plugins as default };
