# Swipe Dispatcher

Dispatch custom swipe events to DOM nodes.

## Usage

Default options shown below.

```js
import SwipeDispatcher from 'swipe-dispatcher';

new SwipeDispatcher( {
  root: document.documentElement,
  maxTime: 333,
  minDistance: 100,
  variance: 100,
  preventMove: true
} );
```
