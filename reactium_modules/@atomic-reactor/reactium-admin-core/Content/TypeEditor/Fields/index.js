import React from 'react';
import { Button, Icon } from 'reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import { Droppable } from 'react-beautiful-dnd';
import cn from 'classnames';
import op from 'object-path';
import _ from 'underscore';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Fields
 * -----------------------------------------------------------------------------
 */
const noop = () => {};
const Fields = props => {
    const CTE = useHandle('ContentTypeEditor');
    const ui = op.get(CTE, 'ui', {});

    const FieldType = useHookComponent('FieldType');

    const region = op.get(props, 'region.id', 'default');
    const regionLabel = op.get(props, 'region.label');
    const regionSlug = op.get(props, 'region.slug', 'default');

    const regions = op.get(ui, 'regions', {});
    const fields = _.compact(
        op.get(ui, ['regionFields', region], []).map(fieldId => {
            return op.get(ui, ['fields', fieldId]);
        }),
    );

    const isEmpty = fields.length < 1;

    const onRegionLabelChange = op.get(props, 'onRegionLabelChange', noop);
    const onRemoveRegion = op.get(props, 'onRemoveRegion', noop);
    const deleteLabel = __('Remove Field Region');
    const immutable = op.has(ui, ['requiredRegions', region]);

    const fieldTypes = _.indexBy(
        Object.values(Reactium.ContentType.FieldType.list),
        'type',
    );

    Reactium.Hook.runSync('content-type-field-type-list', fieldTypes);

    const renderRegion = () => {
        if (region === 'default' && isEmpty) {
            return (
                <div className='empty-message'>
                    <span>
                        {__(
                            'Compose the new Content Type Schema by adding elements from the toolbar here.',
                        )}
                    </span>
                </div>
            );
        }
        return fields.map((field, index) => {
            const type = op.get(fieldTypes, [field.fieldType], {});

            return (
                <FieldType
                    {...type}
                    id={field.fieldId}
                    key={field.fieldId}
                    index={index}
                    fieldTypeComponent={type.component}
                />
            );
        });
    };

    return (
        <Droppable droppableId={region}>
            {({ droppableProps, innerRef, placeholder }) => (
                <div
                    className={cn('types-fields', {
                        'types-fields-empty': isEmpty,
                    })}
                    {...droppableProps}
                    ref={innerRef}>
                    <div
                        className={cn({
                            'field-drop': true,
                            active: CTE.isActiveRegion(region),
                        })}
                        onClick={() => CTE.setActiveRegion(region)}>
                        {typeof regionLabel !== 'undefined' && (
                            <div className='region-label'>
                                <div
                                    className={cn('input-group', {
                                        error:
                                            regionLabel.length < 1 ||
                                            Object.values(regions).find(
                                                reg =>
                                                    reg.id !== region &&
                                                    reg.slug === regionSlug,
                                            ),
                                    })}>
                                    <input
                                        type='text'
                                        value={regionLabel}
                                        placeholder={__('Region Label')}
                                        onChange={e =>
                                            onRegionLabelChange(e.target.value)
                                        }
                                    />
                                    <Button
                                        data-tooltip={deleteLabel}
                                        style={{ width: 50, height: 50 }}
                                        color={
                                            immutable
                                                ? Button.ENUMS.COLOR.TERTIARY
                                                : Button.ENUMS.COLOR.DANGER
                                        }
                                        onClick={onRemoveRegion}
                                        disabled={immutable}>
                                        <span className='sr-only'>
                                            {deleteLabel}
                                        </span>
                                        <Icon.Feather.X />
                                    </Button>
                                </div>
                            </div>
                        )}
                        {
                            // <div>region: {region}</div>
                        }
                        <div>{renderRegion()}</div>
                        {placeholder}
                    </div>
                </div>
            )}
        </Droppable>
    );
};

export default Fields;

/*
{
  "b018bed7-ac03-4ad6-a1d4-19f9ed6f8ec0": {
    "fieldName": "Price",
    "defaultValue": null,
    "min": null,
    "max": null,
    "slider": null,
    "required": true,
    "helpText": null,
    "fieldId": "b018bed7-ac03-4ad6-a1d4-19f9ed6f8ec0",
    "fieldType": "Number",
    "region": "default"
  },
  "5778df1e-9242-46f1-bbeb-b7eea5dd17b0": {
    "fieldName": "Previous Price",
    "defaultValue": null,
    "min": null,
    "max": null,
    "slider": null,
    "required": null,
    "helpText": null,
    "fieldId": "5778df1e-9242-46f1-bbeb-b7eea5dd17b0",
    "fieldType": "Number",
    "region": "default"
  },
  "cf109851-631e-48be-b1ca-e366c34a1d88": {
    "fieldName": "Stock",
    "defaultValue": null,
    "min": null,
    "max": null,
    "slider": null,
    "required": null,
    "helpText": null,
    "fieldId": "cf109851-631e-48be-b1ca-e366c34a1d88",
    "fieldType": "Number",
    "region": "default"
  },
  "a8e66091-ffd2-49c8-864c-93f3c7651004": {
    "fieldName": "Sizes",
    "placeholder": null,
    "multiple": true,
    "options": [
      {
        "label": "xs",
        "value": "xs"
      },
      {
        "label": "sm",
        "value": "sm"
      },
      {
        "label": "md",
        "value": "md"
      },
      {
        "label": "lg",
        "value": "lg"
      },
      {
        "label": "xl",
        "value": "xl"
      },
      {
        "label": "xxl",
        "value": "xxl"
      }
    ],
    "fieldId": "a8e66091-ffd2-49c8-864c-93f3c7651004",
    "fieldType": "Select",
    "region": "default"
  },
  "df9b64cb-5e33-43ff-91e8-6972fc599525": {
    "fieldName": "Images",
    "max": null,
    "type": "IMAGE",
    "required": null,
    "fieldId": "df9b64cb-5e33-43ff-91e8-6972fc599525",
    "fieldType": "Media",
    "region": "default"
  },
  "publisher": {
    "fieldName": "Publish",
    "statuses": "DRAFT,PUBLISHED",
    "simple": true,
    "fieldId": "publisher",
    "fieldType": "Publisher",
    "region": "sidebar"
  }
}
*/
