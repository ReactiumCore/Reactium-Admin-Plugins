import CodeEditor from './index';
import Reactium from 'reactium-core/sdk';
import ReactiumDark from './theme/ReactiumDark';
import ReactiumLight from './theme/ReactiumLight';

Reactium.Plugin.register('CodeEditor').then(() => {
    Reactium.Component.register('CodeEditor', CodeEditor);
    Reactium.CodeEditorTheme.register('ReactiumDark', { theme: ReactiumDark });
    Reactium.CodeEditorTheme.register('ReactiumLight', {
        theme: ReactiumLight,
    });
});
