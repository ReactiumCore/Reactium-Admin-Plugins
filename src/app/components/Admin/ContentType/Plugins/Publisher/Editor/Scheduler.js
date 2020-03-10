import React, { useState, useRef, useEffect } from 'react';
import Reactium, {
    __,
    useHandle,
    useHookComponent,
    useAsyncEffect,
    useFulfilledObject,
} from 'reactium-core/sdk';
import { Scrollbars } from 'react-custom-scrollbars';
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

const today = moment().startOf('day');

const Scheduler = props => {
    const aclTargets = Reactium.Cache.get('acl-targets') || {};
    const users = _.indexBy(aclTargets.users, 'objectId');
    const { editor, config } = props;
    const branches = op.get(editor.value, 'branches');
    const [publish, setPublish] = useState({
        schedule: op.get(editor.value, 'publish', {}),
        branch: op.get(editor.value, 'history.branch', 'master'),
        sunrise: null,
        sunset: null,
    });

    const _contentStatusEventHandler = e => {
        if (!e.value) return;
        const { value } = e;

        const schedule = op.get(value, 'publish', {});
        const branch = op.get(value, 'history.branch', 'master');

        setPublish({
            schedule,
            branch,
            sunrise: null,
            sunset: null,
        });
    };

    // On submit handler
    useEffect(() => {
        if (editor.unMounted()) return;
        editor.addEventListener('clean', _contentStatusEventHandler);

        return () => {
            editor.removeEventListener('clean', _contentStatusEventHandler);
        };
    }, [editor, publish]);

    const setBranch = (selection = []) => {
        const [branch] = selection;
        if (op.has(editor.value, ['branches', branch])) {
            setPublish({
                ...publish,
                branch,
            });
        }
    };

    const selectionToMoment = (selection = []) => {
        const [date] = selection;
        if (date) return moment(date, 'MM-DD-YYYY').startOf('day');
        return null;
    };

    const setDay = (date, type = 'sunrise') => {
        date = selectionToMoment(date);
        if (date) {
            setPublish({
                ...publish,
                [type]: date,
            });
        }
    };

    const setTime = (time, type = 'sunrise') => {
        const date = publish[type] || publish.sunrise || today;
        if (time) {
            const ofDay = moment(time, 'hh:mm:ss A');
            setPublish({
                ...publish,
                [type]: date
                    .clone()
                    .hour(ofDay.hour())
                    .minute(ofDay.minute())
                    .second(ofDay.second()),
            });
        }
    };

    const refs = {
        sunrise: {
            date: useRef(),
            time: useRef(),
        },
        sunset: {
            date: useRef(),
            time: useRef(),
        },
    };

    const canSchedule = () => {
        // simple workflow
        if (config.simple) return false;

        // can't schedule, sorry
        if (!config.can.publish && !config.can.unpublish) return false;

        return true;
    };

    const doSchedule = () => {
        const request = {};
        if (publish.sunrise) {
            request.sunrise = publish.sunrise.format();
            request.history = { branch: publish.branch };
        }
        if (publish.sunset) {
            request.sunset = publish.sunset.format();
        }

        if (Object.values(request).length > 0) {
            editor.schedule(request);
        }
    };

    const doUnSchedule = jobId => {
        editor.unschedule(jobId);
    };

    if (!canSchedule()) {
        return null;
    }

    const dateParams = {
        sunrise: {
            date: {
                ...(publish.sunrise
                    ? { selected: [publish.sunrise.format('MM-DD-YYYY')] }
                    : {}),
                minDate: today.toDate(),
            },
            time: publish.sunrise
                ? {
                      selected: publish.sunrise.format('hh:mm:ss:A').split(':'),
                      value: publish.sunrise.format('hh:mm:ss A'),
                  }
                : {
                      selected: today.format('hh:mm:ss:A').split(':'),
                      value: undefined,
                  },
        },
        sunset: {
            date: {
                ...(publish.sunset
                    ? { selected: [publish.sunset.format('MM-DD-YYYY')] }
                    : {}),
                minDate: publish.sunrise
                    ? publish.sunrise.toDate()
                    : today.toDate(),
            },
            time: publish.sunset
                ? {
                      selected: publish.sunset.format('hh:mm:ss:A').split(':'),
                      value: publish.sunset.format('hh:mm:ss A'),
                  }
                : {
                      selected: today.format('hh:mm:ss:A').split(':'),
                      value: undefined,
                  },
        },
    };

    const renderPickers = type => (
        <div key={type} className={`content-scheduler-${type}`}>
            <h4 className='my-xs-8 h5'>
                <span
                    data-tooltip={ENUMS.SCHEDULING[type].tooltip}
                    data-vertical-align='top'
                    data-align='left'>
                    {ENUMS.SCHEDULING[type].label}
                </span>
            </h4>

            <div className='content-scheduler-pickers'>
                <DatePicker
                    align={DatePicker.ENUMS.ALIGN.LEFT}
                    minDate={moment()
                        .startOf('day')
                        .toDate()}
                    labels={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                    onChange={({ selected }) => setDay(selected, type)}
                    ref={refs[type].date}
                    {...dateParams[type].date}
                />
                <TimePicker
                    ref={refs[type].time}
                    onChange={({ value }) => setTime(value, type)}
                    width={160}
                    {...dateParams[type].time}
                />
            </div>
        </div>
    );

    const renderScheduler = () => (
        <div className='content-scheduler'>
            {['sunrise', 'sunset'].map(type => renderPickers(type))}
            <div className='content-scheduler-branch'>
                <h4 className='my-xs-8 h5'>
                    <span
                        data-tooltip={__('Version of content to schedule')}
                        data-vertical-align='top'
                        data-align='left'>
                        {__('Content Version')}
                    </span>
                </h4>

                <div className='content-scheduler-controls'>
                    <Dropdown
                        className='branch-dropdown'
                        data={Object.entries(branches).map(
                            ([branchId, value]) => ({
                                label: op.get(value, 'label', branchId),
                                value: branchId,
                            }),
                        )}
                        maxHeight={160}
                        selection={[publish.branch]}
                        onChange={({ selection }) => setBranch(selection)}>
                        <Button
                            size={Button.ENUMS.SIZE.XS}
                            color={Button.ENUMS.COLOR.TERTIARY}
                            data-dropdown-element>
                            <div className={'branch-dropdown-label'}>
                                <span>
                                    {op.get(
                                        branches,
                                        [publish.branch, 'label'],
                                        publish.branch,
                                    )}
                                </span>
                                <Icon name='Feather.ChevronDown' />
                            </div>
                        </Button>
                    </Dropdown>

                    <div className='content-scheduler-button'>
                        <Button
                            disabled={!(publish.sunrise || publish.sunset)}
                            size={Button.ENUMS.SIZE.SM}
                            color={Button.ENUMS.COLOR.PRIMARY}
                            title={ENUMS.BUTTON_MODES.SCHEDULE.tooltip}
                            data-tooltip={ENUMS.BUTTON_MODES.SCHEDULE.tooltip}
                            data-vertical-align='top'
                            data-align='left'
                            onClick={doSchedule}>
                            {ENUMS.BUTTON_MODES.SCHEDULE.text}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderScheduleManager = () => {
        const schedule = op.get(publish, 'schedule', {}) || {};
        if (!Object.values(schedule).length) return null;

        const timeItem = (time, label) => {
            return (
                <div className='content-schedule-item-time'>
                    <strong>{label}</strong>
                    <span>{moment(time).format('MMM DD YYYY hh:mm A')}</span>
                </div>
            );
        };

        return (
            <Dialog
                pref='admin.dialog.publisher.manager'
                className='content-schedule'
                header={{ title: __('Scheduled Actions') }}>
                <Scrollbars height={140} autoHeight={true} autoHeightMin={140}>
                    <ul className='content-schedule-list'>
                        {Object.entries(publish.schedule).map(
                            ([jobId, instructions]) => {
                                const { history, userId } = instructions;

                                const user = (
                                    <div className='content-schedule-user'>
                                        <strong>{__('User:')}</strong>
                                        <span>
                                            {op.get(
                                                users,
                                                [userId, 'username'],
                                                __('Unknown User'),
                                            )}
                                        </span>
                                    </div>
                                );

                                const branch = (
                                    <div className='content-schedule-version'>
                                        <strong>{__('Version:')}</strong>
                                        <span>
                                            <span>
                                                {op.get(
                                                    history,
                                                    'branch',
                                                    'master',
                                                )}
                                            </span>
                                            <span className='content-schedule-version-rev'>
                                                {op.has(history, 'revision') &&
                                                    `v${history.revision + 1}`}
                                            </span>
                                        </span>
                                    </div>
                                );

                                return (
                                    <li
                                        key={jobId}
                                        className='content-schedule-item'>
                                        <div className='content-schedule-item-detail'>
                                            {user}
                                            {branch}
                                            {instructions.sunrise &&
                                                timeItem(
                                                    instructions.sunrise,
                                                    ENUMS.SCHEDULING.sunrise
                                                        .label + ':',
                                                )}
                                            {instructions.sunset &&
                                                timeItem(
                                                    instructions.sunset,
                                                    ENUMS.SCHEDULING.sunset
                                                        .label + ':',
                                                )}
                                        </div>
                                        <div className='content-schedule-item-control'>
                                            <Button
                                                size={Button.ENUMS.SIZE.XS}
                                                appearance={
                                                    Button.ENUMS.APPEARANCE.PILL
                                                }
                                                color={
                                                    Button.ENUMS.COLOR.PRIMARY
                                                }
                                                title={
                                                    ENUMS.SCHEDULING.unschedule
                                                        .tooltip
                                                }
                                                data-tooltip={
                                                    ENUMS.SCHEDULING.unschedule
                                                        .tooltip
                                                }
                                                data-vertical-align='top'
                                                data-align='left'
                                                onClick={() =>
                                                    doUnSchedule(jobId)
                                                }>
                                                {
                                                    ENUMS.SCHEDULING.unschedule
                                                        .label
                                                }
                                            </Button>
                                        </div>
                                    </li>
                                );
                            },
                        )}
                    </ul>
                </Scrollbars>
            </Dialog>
        );
    };

    return (
        <Dialog
            pref='admin.dialog.publisher.main'
            header={{ title: __('Scheduled Publishing') }}>
            <>{renderScheduler()}</>
            <>{renderScheduleManager()}</>
        </Dialog>
    );
};

export default Scheduler;
