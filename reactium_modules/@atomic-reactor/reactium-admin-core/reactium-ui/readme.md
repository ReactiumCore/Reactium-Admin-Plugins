![](https://image.ibb.co/ee2WaG/atomic_reactor.png)

# Reactium

A UI Component Library built with Reactium.

-   [Demo](https://ui.reactium.io)

## Quick Start

```
$ npm install
$ npm run local
```

## Usage

```
import React from 'react';
import { PieChart } from '@atomic-reactor/reactium-ui';

const PieChartDemo = ({ data, style }) => (
    <div style={style.flex}>
        <div style={style.demo}>
            <PieChart data={data} />
        </div>
    </div>
);

// Default properties
PieChartDemo.defaultProps = {
    data: [
        { label: 'Cats', value: 1 },
        { label: 'Dogs', value: 1 },
        { label: 'People', value: 2 },
    ],
    style: {
        demo: {
            maxWidth: 500
        },
        flex: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
        }
    }
};

export default PieChartDemo;

```
