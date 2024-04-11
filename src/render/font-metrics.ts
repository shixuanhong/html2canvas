import {FEATURES} from '../core/features';
import {SMALL_IMAGE} from '../core/util';
export interface FontMetric {
    baseline: number;
    middle: number;
}

const SAMPLE_TEXT = 'Hidden Text';

export class FontMetrics {
    private readonly _data: {[key: string]: FontMetric};
    private readonly _document: Document;

    constructor(document: Document) {
        this._data = {};
        this._document = document;
    }

    private createFontHelperSpan(font: string, text?: string) {
        const _font = font.replace(/'/g, '"');
        const span = this._document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absoulte';
        span.style.font = _font;
        span.appendChild(this._document.createTextNode(text ?? SAMPLE_TEXT));
        this._document.body.appendChild(span);
        return span;
    }

    private checkFont(font: string, text?: string) {
        const _window = this._document.defaultView;
        if (_window) {
            const span = this.createFontHelperSpan(font, text);
            const result = _window.getComputedStyle(span).font === span.style.font;
            span.remove();
            return result;
        }
        return false;
    }

    private loadFontByDOM(font: string, text?: string): Promise<boolean> {
        const _window = this._document.defaultView;
        if (_window) {
            return new Promise((resolve, reject) => {
                const span = this.createFontHelperSpan(font, text);
                if (_window.getComputedStyle(span).font === span.style.font) {
                    span.remove();
                    resolve(true);
                } else {
                    let count = 0;
                    const timer = setInterval(() => {
                        if (count > 5) {
                            clearInterval(timer);
                            reject(new Error('Failed to load font: number of retries exceeded.'));
                            return;
                        }
                        if (_window.getComputedStyle(span).font === span.style.font) {
                            span.remove();
                            clearInterval(timer);
                            resolve(true);
                        }
                        count++;
                    }, 200);
                }
            });
        }
        return Promise.reject(
            new Error('The `window` object associated with the current `document` object does not exist')
        );
    }

    private loadFont(font: string, text?: string): Promise<boolean> {
        const targetText = text ?? SAMPLE_TEXT;
        if (FEATURES.SUPPORT_FONT_FACE_SET_LOAD) {
            if (FEATURES.SUPPORT_FONT_FACE_SET_CHECK && !this._document.fonts.check(font, targetText)) {
                return this._document.fonts.load(font, SAMPLE_TEXT).then(() => true);
            } else if (!FEATURES.SUPPORT_FONT_FACE_SET_CHECK && !this.checkFont(font, targetText)) {
                return this._document.fonts.load(font, SAMPLE_TEXT).then(() => true);
            }
            return Promise.resolve(true);
        } else {
            if (!this.checkFont(font, targetText)) {
                return this.loadFontByDOM(font, targetText);
            }
            return Promise.resolve(true);
        }
    }

    private async parseMetrics(fontFamily: string, fontSize: string): Promise<FontMetric> {
        const font = `${fontSize} ${fontFamily}`;
        await this.loadFont(font, SAMPLE_TEXT);
        const container = this._document.createElement('div');
        const img = this._document.createElement('img');
        const span = this._document.createElement('span');

        const body = this._document.body as HTMLBodyElement;

        container.style.visibility = 'hidden';
        container.style.fontFamily = fontFamily;
        container.style.fontSize = fontSize;
        container.style.margin = '0';
        container.style.padding = '0';
        container.style.whiteSpace = 'nowrap';

        body.appendChild(container);

        img.src = SMALL_IMAGE;
        img.width = 1;
        img.height = 1;

        img.style.margin = '0';
        img.style.padding = '0';
        img.style.verticalAlign = 'baseline';

        span.style.fontFamily = fontFamily;
        span.style.fontSize = fontSize;
        span.style.margin = '0';
        span.style.padding = '0';

        span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
        container.appendChild(span);
        container.appendChild(img);
        const baseline = img.offsetTop - span.offsetTop + 2;

        container.removeChild(span);
        container.appendChild(this._document.createTextNode(SAMPLE_TEXT));

        container.style.lineHeight = 'normal';
        img.style.verticalAlign = 'super';

        const middle = img.offsetTop - container.offsetTop + 2;

        body.removeChild(container);

        return {baseline, middle};
    }
    async getMetrics(fontFamily: string, fontSize: string): Promise<FontMetric> {
        const key = `${fontFamily} ${fontSize}`;
        if (typeof this._data[key] === 'undefined') {
            this._data[key] = await this.parseMetrics(fontFamily, fontSize);
        }

        return this._data[key];
    }
}
