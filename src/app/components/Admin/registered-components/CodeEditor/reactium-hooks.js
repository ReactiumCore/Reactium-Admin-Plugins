import CodeEditor from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('CodeEditor').then(() => {
    Reactium.Component.register('CodeEditor', CodeEditor);
});
