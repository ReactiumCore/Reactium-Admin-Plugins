/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import React, { Component, Fragment } from 'react';
import uuid from 'uuid/v4';
import FieldTypeDialog from 'components/Admin/ContentType/FieldType/Dialog';

/**
 * -----------------------------------------------------------------------------
 * Toolkit Element: FieldTypeOrganism
 * -----------------------------------------------------------------------------
 */

class FieldTypeOrganism extends Component {
    static dependencies() {
        return typeof module !== 'undefined' ? module.children : [];
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <FieldTypeDialog id={uuid()} type='text'>
                Field Type Form Elements Here
            </FieldTypeDialog>
        );
    }
}

// Default properties
FieldTypeOrganism.defaultProps = {};

export default FieldTypeOrganism;
