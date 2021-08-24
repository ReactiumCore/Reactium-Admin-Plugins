/**
 * Simple function that allows you to select specif prop keys.
 */
import op from 'object-path';

export default ({ props, exclude, include }) => {
    let output = { ...props };

    if (include) {
        output = include.reduce((obj, key) => {
            op.set(obj, key, obj.get(props, key));
            return obj;
        }, output);
    }

    if (exclude) {
        output = exclude.reduce((obj, key) => {
            op.del(obj, key);
            return obj;
        }, output);
    }

    return output;
};
