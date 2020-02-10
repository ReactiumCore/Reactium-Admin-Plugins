import RTEPlugin from '../RTEPlugin';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import withBold from './withBold';
import withColor from './withColor';
import withData from './withData';
import withFont from './withFont';
import withFormatter from './withFormatter';
import withGrid from './withGrid';
import withLink from './withLink';
import withItalic from './withItalic';
import withList from './withList';
import withMediaImage from './withMediaImage';
import withStrike from './withStrike';
import withUnderline from './withUnderline';

export default plugins = {
    withReact: new RTEPlugin({ callback: withReact, order: 0 }),
    withHistory: new RTEPlugin({ callback: withHistory, order: 1 }),
    withData,
    withBold,
    withColor,
    withFont,
    withFormatter,
    withGrid,
    withLink,
    withItalic,
    withMediaImage,
    withList,
    withStrike,
    withUnderline,
};
