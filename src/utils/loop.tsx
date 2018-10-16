function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
};
const loop = (cb: (delta: number) => void) => {
  let now = timestamp();
  const tick = () => {
    cb(timestamp() - now);
    now = timestamp();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}


export default loop;