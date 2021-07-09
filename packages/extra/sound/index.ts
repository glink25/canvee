const context = new AudioContext();

function request<T>(url: string) {
  const req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = "arraybuffer";

  return new Promise<T>((res, rej) => {
    // 异步解码
    req.onload = () => {
      context.decodeAudioData(
        req.response,
        (buffer) => {
          res(buffer as unknown as T);
        },
        rej,
      );
    };
    req.send();
  });
}

type SoundArg = {
  audio: string | AudioBuffer;
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
};
type PlayArg = {
  overlap?: boolean;
  offset?: number;
};
export default class Sound {
  private buffer?: AudioBuffer;

  private source?: AudioBufferSourceNode;

  private gainNode?: GainNode;

  private loop: boolean;

  private playTime?: Date;

  private playedProgress = -1;

  #volume;

  set volume(v: number) {
    if (this.gainNode) this.gainNode.gain.value = v;
    this.#volume = v;
  }

  get volume() {
    return this.#volume;
  }

  constructor({ audio, autoplay = false, loop = false, volume = 1 }: SoundArg) {
    if (typeof audio === "string") {
      request<AudioBuffer>(audio)
        .then((e) => {
          this.buffer = e;
          if (autoplay) {
            this.play();
          }
        })
        .catch((e) => {
          throw new Error(e);
        });
    } else this.buffer = audio;
    this.loop = loop;
    this.#volume = volume;
  }

  private setGainNode() {
    if (!this.source) return;
    this.gainNode = context.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(context.destination);
    this.gainNode.gain.value = this.volume;
  }

  private setSourceNode() {
    if (!this.buffer) return;
    const source = context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(context.destination);
    source.loop = this.loop;
    this.source = source;
    this.source!.onended = () => {
      if (this.playedProgress !== -1) {
        this.playTime = undefined;
        this.playedProgress = -1;
      }
    };
    this.setGainNode();
  }

  play(arg?: PlayArg) {
    if (!this.buffer) return;
    if (this.source) {
      if (arg?.overlap !== false) this.destroyOldSource();
    }
    this.setSourceNode();
    this.playTime = new Date();
    this.source!.start(0, arg?.offset ?? 0);
  }

  pause() {
    if (!this.playTime) return;
    this.source?.stop();
    this.destroyOldSource();
    this.playedProgress += new Date().valueOf() - this.playTime?.valueOf();
  }

  resume() {
    this.play({ offset: this.playedProgress / 1000 });
  }

  stop() {
    this.source?.stop();
    this.destroyOldSource();
  }

  private destroyOldSource() {
    this.source?.stop();
    this.source?.disconnect();
  }
}
