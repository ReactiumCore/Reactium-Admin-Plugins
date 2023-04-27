import React from 'react';
import Collapsible from './index';
import { shallow } from 'reactium-core/enzyme';

test('<Collapsible />', () => {
    const component = shallow(<Collapsible />);

    expect(component.html().length).toBeGreaterThan(0);
});
