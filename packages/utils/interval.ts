class Interval {
  quene: Array<{ name: string; fn: () => void }>;

  #frame = 60;

  #time = new Date();

  constructor() {
    this.quene = [];
    const step = () => {
      this.quene.forEach(({ fn }) => fn());

      const now = new Date();
      this.#frame = Math.floor(1000 / (now.valueOf() - this.#time.valueOf()));
      this.#time = now;
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  add(name: string, fn: () => void) {
    this.quene.push({ name, fn });
  }

  remove(n: string, f: () => void) {
    this.quene = this.quene.filter(({ name, fn }) => name !== n || f !== fn);
  }

  getFrame() {
    return this.#frame;
  }
}
// singleton refresh timer
const interval = new Interval();

export default interval;
