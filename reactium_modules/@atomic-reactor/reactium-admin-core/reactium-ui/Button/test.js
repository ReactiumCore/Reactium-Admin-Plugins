import React from 'react';
import Button from './index';
import { shallow } from 'reactium-core/enzyme';

test('<Button />', () => {
    const component = shallow(<Button />);

    expect(component.html().length).toBeGreaterThan(0);
});
