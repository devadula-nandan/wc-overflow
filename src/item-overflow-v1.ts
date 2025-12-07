import { LitElement, html, css, TemplateResult, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";

type Item = { label?: string; _width?: number; [key: string]: any };

export class OverflowWc extends LitElement {
  // Refs for each rendered item wrapper
  private itemRefs: Ref<HTMLElement>[] = [];

  // Ref for overflow renderer wrapper
  private overflowRef: Ref<HTMLElement> = createRef<HTMLElement>();

  // Resize observer
  private resizeObserver: ResizeObserver | null = null;

  /** Measured widths of each item (in px) */
  @state()
  private measuredWidths: number[] = [];

  /** Measured width of overflow element */
  @state()
  private overflowWidth = 0;

  /** Has initial measurement completed */
  @state()
  private measured = false;

  /** How many items fit */
  @state()
  private visibleCount = 0;

  /** Cached cumulative widths (prefix sums) */
  private _cumulativeWidths: number[] | null = null;

  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      text-align: left;
    }
    span {
      display: inline-block;
    }
    *:not(:defined) {
      display: none;
    }
    cds-tag,
    cds-operational-tag,
    cds-dismissible-tag {
      margin: 0.125rem;
    }
  `;

  /** Items to render */
  @property({ type: Array })
  items: Item[] = [];

  /** Item renderer */
  @property({ attribute: false })
  itemRenderer: ((item: any, index: number) => TemplateResult) | null = null;

  /** Overflow renderer */
  @property({ attribute: false })
  overflowRenderer: ((hiddenItems: any[]) => TemplateResult) | null = null;

  async firstUpdated() {
    await this.updateComplete;
    this.measureAllItems();

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.onContainerResize());
      this.resizeObserver.observe(this.parentElement || this);
    }
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("items")) {
      this.measured = false;
      this.itemRefs = [];
      this.updateComplete.then(() => this.measureAllItems());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private measureAllItems() {
    this.items.forEach((_, i) => {
      if (!this.itemRefs[i]) this.itemRefs[i] = createRef<HTMLElement>();
    });

    this.updateComplete.then(() => {
      const widths: number[] = [];
      this.items.forEach((_, index) => {
        const el = (this.itemRefs[index]?.value as HTMLElement) || null;
        widths[index] = el ? el.getBoundingClientRect().width : 0;
      });
      this.measureOverflowWidth();

      this.measuredWidths = widths;
      this.measured = true;

      this.updateComplete.then(() => {
        this.computeVisibleForCurrentWidth();
      });
    });
  }

  private measureOverflowWidth() {
    const el = this.overflowRef.value;
    this.overflowWidth = el?.getBoundingClientRect().width ?? 0;
  }

  private onContainerResize() {
    this.computeVisibleForCurrentWidth();
  }

  private computeVisibleForCurrentWidth() {
    const containerWidth = this.parentElement?.clientWidth ?? 0;
    const widths = this.measuredWidths;
    const totalItems = this.items.length;

    if (totalItems === 0 || containerWidth <= 0) {
      if (this.visibleCount !== 0) this.visibleCount = 0;
      return;
    }

    if (
      !this._cumulativeWidths ||
      this._cumulativeWidths.length !== widths.length
    ) {
      const cumulative = new Array(widths.length);
      let sum = 0;
      for (let i = 0; i < widths.length; i++) {
        sum += widths[i] ?? 0;
        cumulative[i] = sum;
      }
      this._cumulativeWidths = cumulative;
    }

    const cumulative = this._cumulativeWidths;
    const overflowWidth = this.overflowWidth || 0;

    let lo = 0,
      hi = widths.length - 1,
      mid;
    while (lo <= hi) {
      mid = (lo + hi) >> 1;
      if (cumulative[mid] <= containerWidth) lo = mid + 1;
      else hi = mid - 1;
    }

    let count = lo;
    const overflowingItems = totalItems - count;
    const shouldReserveOverflow = overflowingItems > 0 && overflowWidth > 0;

    if (shouldReserveOverflow) {
      while (
        count > 0 &&
        cumulative[count - 1] + overflowWidth > containerWidth
      ) {
        count--;
      }
    }

    if (count !== this.visibleCount) {
      this.visibleCount = count;
    }
  }

  render() {
    const {
      items,
      visibleCount,
      itemRenderer,
      overflowRenderer,
      measured,
      itemRefs,
    } = this;

    if (!itemRenderer) {
      return html`<div>No renderer provided</div>`;
    }

    // First render / Measurement phase → render all items + overflow for measuring
    if (!measured) {
      items.forEach((_, i) => {
        if (!itemRefs[i]) itemRefs[i] = createRef<HTMLElement>();
      });

      return html`
        ${items.map(
          (item, index) =>
            html`<span ${ref(itemRefs[index])}
              >${itemRenderer!(item, index)}</span
            >`
        )}
        ${overflowRenderer
          ? html`<span ${ref(this.overflowRef)}
              >${overflowRenderer(items)}</span
            >`
          : nothing}
      `;
    }

    if (visibleCount === 0) return nothing;

    const renderedItems = items
      .slice(0, visibleCount)
      .map((item, index) => html`<span>${itemRenderer!(item, index)}</span>`);

    const overflow =
      visibleCount < items.length
        ? html`<span ${ref(this.overflowRef)}
            >${overflowRenderer!(items.slice(visibleCount))}</span
          >`
        : nothing;

    // Final render phase → render visible items + overflow if needed
    return html`${renderedItems}${overflow}`;
  }
}

customElements.define("overflow-wc", OverflowWc);
