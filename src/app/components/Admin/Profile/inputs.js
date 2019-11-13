import ENUMS from './enums';

export default [
    {
        type: 'hidden',
        name: 'objectId',
    },
    {
        type: 'hidden',
        name: 'avatar',
    },
    {
        type: 'heading',
        children: ENUMS.TEXT.INPUT.ACCOUNT_INFO,
    },
    {
        autoComplete: 'off',
        name: 'email',
        placeholder: ENUMS.TEXT.INPUT.EMAIL,
        type: 'email',
        required: true,
    },
    {
        type: 'heading',
        children: ENUMS.TEXT.INPUT.NAME,
    },
    {
        autoComplete: 'off',
        name: 'fname',
        placeholder: ENUMS.TEXT.INPUT.FNAME,
        type: 'text',
    },
    {
        autoComplete: 'off',
        name: 'lname',
        placeholder: ENUMS.TEXT.INPUT.LNAME,
        type: 'text',
    },
];
