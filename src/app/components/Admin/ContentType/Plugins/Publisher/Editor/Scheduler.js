import React, { useState, useRef, useEffect } from 'react';
import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useAsyncEffect,
    useFulfilledObject,
} from 'reactium-core/sdk';

import {
    Button,
    Icon,
    DatePicker,
    TimePicker,
    Dialog,
    Dropdown,
} from '@atomic-reactor/reactium-ui';

import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import uuid from 'uuid/v4';
import moment from 'moment';
import ENUMS from './enums';

const Scheduler = props => {
    const { editor, config } = props;

    const canSchedule = () => {
        // simple workflow
        if (config.simple) return false;

        if (!config.can.publish && !config.can.unpublish) return false;

        return true;
    };

    if (!canSchedule()) {
        return null;
    }

    return (
        <Dialog header={{ title: __('Schedule Publishing') }}>
            <div className='content-scheduler'>
                <div className='content-scheduler-sunrise'>
                    <DatePicker
                        readOnly
                        maxDate={moment()
                            .endOf('month')
                            .toDate()}
                        minDate={moment()
                            .startOf('day')
                            .toDate()}
                        labels={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default Scheduler;
