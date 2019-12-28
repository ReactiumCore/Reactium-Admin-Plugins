import React, { forwardRef } from 'react';
import { TagsInput } from '@atomic-reactor/reactium-ui';

const Directory = ({ data }) => {
    return (
        data && (
            <div className='form-group'>
                <label>
                    Directory:
                    <select name='directory'>
                        {data.map((item, i) => (
                            <option key={`directory-${i}`}>{item}</option>
                        ))}
                    </select>
                </label>
            </div>
        )
    );
};

const Tags = forwardRef(({ data = [], onChange = noop }, ref) => {
    return (
        <>
            <div className='form-group mb-xs-0'>
                <label>Tags:</label>
            </div>
            <TagsInput
                ref={ref}
                placeholder='Add tag'
                name='meta.tags'
                onChange={e => onChange(e)}
            />
        </>
    );
});

export { Directory, Tags };
