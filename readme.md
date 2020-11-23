# Swipe Dispatcher

Dispatch custom `swipe` events to DOM nodes.

## Install

```shell
npm install swipe-dispatcher --save
```

## Usage

```js
import SwipeDispatcher from 'swipe-dispatcher';

new SwipeDispatcher( { /* options */ } );
```

## Options

| Option | Default | Description |
| :----- | :------ | :---------- |
| `root`   | `document.documentElement` | Event listeners get attached to this node |
| `maxTime` | `333` | The maximum time a swipe should take |
| `minDistance` | `100` | The minimum move distance |
| `variance` | `100` | The allowed horizontal/vertical variance |
| `preventMove` | `true` | Should `preventDefault` be called on `touchmove` |
