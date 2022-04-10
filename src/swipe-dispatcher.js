import 'custom-event-polyfill';

export default class SwipeDispatcher
{
  events = {
    start: [ 'touchstart', 'mousedown' ],
    move: [ 'touchmove', 'mousemove' ],
    end: [ 'touchend', 'mouseup' ],
  };

  constructor( {
    root = document.documentElement,
    maxTime = 333,
    minDistance = 100,
    variance = 100,
    preventMove = true,
  } = {} )
  {
    this.root = root;
    this.maxTime = maxTime;
    this.minDistance = minDistance;
    this.variance = variance;
    this.preventMove = !! preventMove;

    this.reset();
  }

  setEventListeners( handlers = { start: true, move: true, end: true } )
  {
    Object.getOwnPropertyNames(handlers).forEach( name => {
      if ( this.events[ name ] ) {
        this.events[ name ].forEach( event => {
          if ( handlers[ name ] ) {
            this.root.addEventListener( event, this, false );
          } else {
            this.root.removeEventListener( event, this, false );
          }
        });
      }
    });
  }

  handleStart( event )
  {
    this.recordData('start', event );
    this.setEventListeners( { move: true, end: true } );
  }

  handleMove( event )
  {
    if ( this.preventMove ) {
      event.preventDefault();
    }

    if ( performance.now() - this.data.start.time > this.maxTime ) {
      this.reset();
    }
  }

  handleEnd( event )
  {
    this.recordData('end', event );
    this.maybeTriggerSwipe();
    this.reset();
  }

  handleEvent( event )
  {
    switch (event.type) {
      case 'mousedown':
      case 'touchstart':
        this.handleStart( event );
        break;
      case 'mousemove':
      case 'touchmove':
        this.handleMove( event );
        break;
      case 'mouseup':
      case 'touchend':
        this.handleEnd( event );
        break;
    }
  }

  recordData( key, event )
  {
    const { target } = event;
    const touch = event.changedTouches && event.changedTouches.length === 1 ? event.changedTouches[ 0 ] : false;
    const time = performance.now();
    const { pageX } = touch ? touch : event;
    const { pageY } = touch ? touch : event;

    this.data[ key ] = { target, time, x: pageX, y: pageY };
  }

  isSwipe( start, end, xy )
  {
    const isWithinSwipeTime = (end.time - start.time) <= this.maxTime;
    const isWithinVariance = Math.abs(end[ xy ? 'y' : 'x' ] - start[ xy ? 'y' : 'x' ]) <= this.variance;
    const hasMinSwipeDistance = Math.abs(end[ xy ? 'x' : 'y' ] - start[ xy ? 'x' : 'y' ]) >= this.minDistance;

    return isWithinSwipeTime && isWithinVariance && hasMinSwipeDistance;
  }

  maybeTriggerSwipe()
  {
    const { start, end } = this.data;

    if ( ! start || ! end ) {
      return;
    }

    const isHorizontalSwipe = this.isSwipe( start, end, true );
    const isVerticalSwipe = this.isSwipe( start, end, false );

    if ( isHorizontalSwipe || isVerticalSwipe ) {
      start.target.dispatchEvent(
        new CustomEvent('swipe', {
          detail: {
            left: isHorizontalSwipe && end.x - start.x < 0,
            right: isHorizontalSwipe && end.x - start.x > 0,
            up: isVerticalSwipe && end.y - start.y < 0,
            down: isVerticalSwipe && end.y - start.y > 0,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  }

  reset()
  {
    this.data = {
      start: null,
      end: null,
    };

    this.setEventListeners( { start: true, move: false, end: false } );
  }

  stop()
  {
    this.setEventListeners( { start: false, move: false, end: false } );
  }
}
