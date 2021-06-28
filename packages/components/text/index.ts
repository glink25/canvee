import Component, { ComponentArg } from "~/core/component";
import { Color, DeepRequied } from "~/type";
import { mergeConfig, reactive } from "~/utils";

type TextArg = {
  text: string;
  style?: {
    color?: Color;
    fontFamily?: string;
    fontSize?: number;
    textAign?: CanvasTextAlign;
    textBaseLine?: CanvasTextBaseline;
    fontWeight?:
      | "normal"
      | "bold"
      | "bolder"
      | "lighter"
      | 100
      | 200
      | 300
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900;
    fontStyle?: "normal" | "italic" | "oblique";
  };
};
const defaultTextArg: { style: DeepRequied<TextArg>["style"] } = {
  style: {
    color: "black",
    fontFamily: "sans-serif",
    fontSize: 20,
    fontWeight: "normal",
    fontStyle: "normal",
    textAign: "center",
    textBaseLine: "middle",
  },
};
/**
 *
 *
 * @export
 * @class Text
 * @extends {Component}
 * 加载文本组件，用于显示文本
 */
export default class Text extends Component {
  style: DeepRequied<TextArg>["style"];

  measure?: TextMetrics;

  #isCustomSize: boolean;

  #text: string;

  #isTextEdited: boolean;

  constructor({ ...arg }: ComponentArg & TextArg) {
    super(arg);
    if (!arg.transform?.size) {
      this.#isCustomSize = false;
    } else {
      this.#isCustomSize = false;
    }
    this.#isTextEdited = true;
    this.#text = arg.text;
    const style = mergeConfig(defaultTextArg.style, arg.style);
    this.style = reactive(style, () => {
      this.update();
    });
  }

  /** @internal */
  render(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.style.fontStyle} normal ${this.style.fontWeight} ${this.style.fontSize}px ${this.style.fontFamily}`;
    this.measure = ctx.measureText(this.text);

    if (!this.#isCustomSize && this.#isTextEdited) {
      this.transform.size.width = this.measure.width;
      this.transform.size.height = this.style.fontSize;
      this.#isTextEdited = false;
    }
    ctx.textAlign = this.style.textAign!;
    ctx.textBaseline = "middle";
    ctx.fillStyle = this.style.color;
    ctx.fillText(
      this.text,
      this.transform!.size.width * this.transform.origin.x,
      this.transform!.size.height * this.transform.origin.y,
    );
  }

  set text(v) {
    if (v === this.#text) return;
    this.#isTextEdited = true;
    this.#text = v;
    this.update();
  }

  get text() {
    return this.#text;
  }
}
