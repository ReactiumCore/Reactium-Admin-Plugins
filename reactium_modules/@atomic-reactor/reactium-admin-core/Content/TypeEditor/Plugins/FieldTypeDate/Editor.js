import _ from 'underscore';
import moment from 'moment';
import cn from 'classnames';
import React, { useCallback, useEffect } from 'react';
import { useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const formatDate = (d) => {
    if (typeof d === 'string') {
        d = new Date(d);
    }
    return d ? moment(d).format('L') : null;
};

const Editor = (props) => {
    const { editor, fieldName } = props;

    const { max, min, required } = props.options;

    const { DatePicker, FormError, FormRegister } =
        useHookComponent('ReactiumUI');

    const ElementDialog = useHookComponent('ElementDialog');

    const value = editor.Form ? editor.Form.value[fieldName] : null;

    const onSelectDate = useCallback((e) => {
        const selected = _.compact(e.selected || []);
        const date = selected.length > 0 ? _.first(selected) : null;
        editor.setValue(fieldName, formatDate(date));
    }, []);

    const onSubmit = (e) => {
        let v = editor.Form.value[fieldName];

        // console.log(v);
    };

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
            '%max': max,
            '%min': min,
        };

        str = String(str);

        Object.entries(replacers).forEach(([s, v]) => {
            str = str.replace(new RegExp(s, 'gi'), v);
        });

        return str;
    };

    const validate = ({ values }) => {
        let err;

        let v = values[fieldName];

        if (!err && !v && required === true) {
            err = parseError(__('%fieldName is required'));
        }

        v = moment(v, 'L');

        if (!err && !v.isValid()) {
            err = parseError(__('%fieldName invalid date'));
        }

        if (!err && min && v.isBefore(moment(min, 'L'))) {
            err = parseError(__('%fieldName date must be on or after %min'));
        }

        if (!err && min && v.isAfter(moment(max, 'L'))) {
            err = parseError(__('%fieldName date must be on or before %max'));
        }

        if (err) editor.setError(fieldName, err);
    };

    const errorText = editor.Form.error(fieldName);
    const className = cn('form-group', { error: !!errorText });

    useEffect(() => {
        editor.addEventListener('submit', onSubmit);
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('submit', onSubmit);
            editor.removeEventListener('validate', validate);
        };
    }, []);

    return !editor.Form ? null : (
        <FormRegister>
            <ElementDialog {...props}>
                <div className='field-type-date p-xs-20'>
                    <div className={className}>
                        <DatePicker
                            value={value}
                            readOnly={Boolean(min || max)}
                            onChange={onSelectDate}
                            aria-invalid={!!errorText}
                            maxDate={max ? moment(max, 'L').toDate() : null}
                            minDate={min ? moment(min, 'L').toDate() : null}
                        />
                        <FormError name={fieldName} />
                    </div>
                </div>
            </ElementDialog>
        </FormRegister>
    );
};

export { Editor, Editor as default };
