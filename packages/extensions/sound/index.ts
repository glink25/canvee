type SoundArg = {
  audio: HTMLAudioElement | string;
  autoplay?: boolean;
  loop?: boolean;
};
// 非Canvee extension，可以单独使用
// 考虑兼容性，使用Audio实现而非Web Audio api
export default class Sound {
  audio: HTMLAudioElement;

  autoplay: boolean;

  constructor({ audio, autoplay = false, loop = false }: SoundArg) {
    if (typeof audio === "string") {
      this.audio = new Audio();
      this.audio.src = audio;
    } else {
      this.audio = audio;
    }
    this.autoplay = autoplay;
    this.audio.loop = loop;
    this.init();
  }

  init() {
    if (this.autoplay) {
      this.audio.play().catch(() => {
        // 部分浏览器禁止自动播放音频，因此在用户交互后立即播放音频
        const events = ["touchend", "click"];
        const funcs = events.map((event) => {
          const func = () => {
            this.audio.play();
            funcs.forEach((f) => {
              document.body.removeEventListener(event, f);
            });
          };
          return func;
        });
        events.forEach((event, index) => {
          document.body.addEventListener(event, funcs[index]);
        });
      });
    }
  }

  play() {
    return this.audio.play();
  }

  pause() {}

  resume() {}

  stop() {}
}
