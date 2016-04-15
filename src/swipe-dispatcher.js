import 'custom-event-polyfill';
import { now } from './helpers';

class SwipeDispatcher
{
  constructor( { root = document.documentElement, maxTime = 333, minDistance = 100, variance = 100, preventMove = true } = {} )
  {
    this.root        = root;
    this.maxTime     = maxTime;
    this.minDistance = minDistance;
    this.variance    = variance;
    this.preventMove = !!preventMove;

    this.events = {
      start: [ 'touchstart', 'mousedown' ],
      move: [ 'touchmove', 'mousemove' ],
      end: [ 'touchend', 'mouseup' ]
    };

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

  handleStart( e )
  {
    e.preventDefault();
    this.recordData('start', e );
    this.setEventListeners( { move: true, end: true } );
  }

  handleMove( e )
  {
    if ( this.preventMove ) {
      e.preventDefault();
    }

    let { 'start': { time } } = this.data;

    if ( now() - time > this.maxTime ) {
      this.reset();
    }
  }

  handleEnd( e )
  {
    e.preventDefault();
    this.recordData('end', e );
    this.maybeTriggerSwipe();
    this.reset();
  }

  handleEvent( e )
  {
    switch (e.type) {
      case 'mousedown':
      case 'touchstart':
        this.handleStart( e );
        break;
      case 'mousemove':
      case 'touchmove':
        this.handleMove( e );
        break;
      case 'mouseup':
      case 'touchend':
        this.handleEnd( e );
        break;
    }
  }

  recordData( key, e )
  {
    let touch  = e.changedTouches ? e.changedTouches[ 0 ] : false;
    let target = e.target;
    let time   = now();
    let x      = touch ? touch.pageX : e.pageX;
    let y      = touch ? touch.pageY : e.pageY;

    this.data[ key ] = { target, time, x, y };
  }

  isSwipe( start, end, xy )
  {
    let isWithinSwipeTime   = (end.time - start.time) <= this.maxTime;
    let isWithinVariance    = Math.abs(end[ xy ? 'y' : 'x' ] - start[ xy ? 'y' : 'x' ]) <= this.variance;
    let hasMinSwipeDistance = Math.abs(end[ xy ? 'x' : 'y' ] - start[ xy ? 'x' : 'y' ]) >= this.minDistance;

    return isWithinSwipeTime && hasMinSwipeDistance  && isWithinVariance;
  }

  maybeTriggerSwipe()
  {
    let { start, end } = this.data;

    if ( ! start || ! end ) {
      return;
    }

    let isHorizontalSwipe = this.isSwipe( start, end, true );
    let isVerticalSwipe   = this.isSwipe( start, end, false );

    if ( isHorizontalSwipe || isVerticalSwipe ) {
      start.target.dispatchEvent(
        new CustomEvent('swipe', {
          detail: {
            left:  isHorizontalSwipe && end.x - start.x < 0,
            right: isHorizontalSwipe && end.x - start.x > 0,
            up:    isVerticalSwipe   && end.y - start.y < 0,
            down:  isVerticalSwipe   && end.y - start.y > 0
          },
          bubbles: true,
          cancelable: true
        })
      );
    }
  }

  reset()
  {
    this.data = {
      start: null,
      end: null
    };

    this.setEventListeners( { start: true, move: false, end: false } );
  }

}

export default SwipeDispatcher;
