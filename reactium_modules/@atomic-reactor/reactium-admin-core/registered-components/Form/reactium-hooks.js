import Reactium from 'reactium-core/sdk';
import * as Form from './index';

(async () => {
    await Reactium.Plugin.register('attach-reactiumui-form');
    const ReactiumUI = Reactium.Component.get('ReactiumUI');
    Object.entries(Form).forEach(([key, value]) => {
        ReactiumUI[key] = value;
    });
})();
