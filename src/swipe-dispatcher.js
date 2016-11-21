import 'perfnow';
import 'custom-event-polyfill';

export default class SwipeDispatcher
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
    this.recordData('start', e );
    this.setEventListeners( { move: true, end: true } );
  }

  handleMove( e )
  {
    if ( this.preventMove ) {
      e.preventDefault();
    }

    if ( performance.now() - this.data.start.time > this.maxTime ) {
      this.reset();
    }
  }

  handleEnd( e )
  {
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
    const touch  = e.changedTouches && e.changedTouches.length === 1 ? e.changedTouches[ 0 ] : false;
    const target = e.target;
    const time   = performance.now();
    const x      = touch ? touch.pageX : e.pageX;
    const y      = touch ? touch.pageY : e.pageY;

    this.data[ key ] = { target, time, x, y };
  }

  isSwipe( start, end, xy )
  {
    const isWithinSwipeTime   = (end.time - start.time) <= this.maxTime;
    const isWithinVariance    = Math.abs(end[ xy ? 'y' : 'x' ] - start[ xy ? 'y' : 'x' ]) <= this.variance;
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
    const isVerticalSwipe   = this.isSwipe( start, end, false );

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
