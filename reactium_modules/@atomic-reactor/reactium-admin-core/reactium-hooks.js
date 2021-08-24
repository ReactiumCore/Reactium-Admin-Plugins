import { Link } from 'react-router-dom';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';

Reactium.Plugin.register('ButtonEnums').then(
    () => (Button.ENUMS.ELEMENT.LINK = props => <Link {...props} />),
);
