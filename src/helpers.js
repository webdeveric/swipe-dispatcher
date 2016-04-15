export const now = ( performance => {
  if ( performance ) {
    return performance.now.bind(performance);
  }

  let start = Date.now ? Date.now() : new Date().getTime();

  return Date.now ?
    () => { Date.now() - start; } :
    () => { new Date().getTime() - start; };
})(window.performance);
