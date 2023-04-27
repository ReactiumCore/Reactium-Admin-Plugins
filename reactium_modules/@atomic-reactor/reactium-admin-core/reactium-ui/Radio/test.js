import React from 'react';
import Radio from './index';
import { shallow } from 'reactium-core/enzyme';

test('<Radio />', () => {
    const component = shallow(<Radio />);

    expect(component.html().length).toBeGreaterThan(0);
});
