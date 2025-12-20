import "./item-overflow-v1.js";
import { html } from "lit";

const TAG_TYPES = [
  "red",
  "magenta",
  "purple",
  "blue",
  "cyan",
  "teal",
  "green",
  "gray",
  "cool-gray",
  "warm-gray",
];

const WORDS = [
  "Alpha",
  "Beta",
  "Gamma",
  "Delta",
  "Orion",
  "Zenith",
  "Nova",
  "Cosmos",
  "Pixel",
  "Quantum",
];

function createItems(count: number) {
  const items = new Array(count);
  const wordsLen = WORDS.length;
  const typesLen = TAG_TYPES.length;

  const handleClick = (id: number, word: string) => {
    alert(`Clicked item-${id} ${word}`);
  };

  for (let i = 0; i < count; i++) {
    const index = i + 1;
    const word = WORDS[i % wordsLen];

    items[i] = {
      id: `item-${index}`,
      label: word,
      type: TAG_TYPES[i % typesLen],
      onClick: () => handleClick(index, word),
    };
  }

  return items;
}

type ItemVariant = "tag" | "dismissable-tag" | "button" | "icon-button";
type OverflowVariant = ItemVariant | "operational-tag" | "overflow-menu";

// runtime-configurable variants (updated by the controls)
let ITEM_VARIANT: ItemVariant = "tag";
let OVERFLOW_VARIANT: OverflowVariant = "operational-tag";

function itemRenderer(item: any) {
  switch (ITEM_VARIANT) {
    case "tag":
      return html`
        <cds-tag data-id=${item.id} type=${item.type} size="md">
          ${item.label}
        </cds-tag>
      `;

    case "dismissable-tag":
      return html`
        <cds-dismissible-tag
          dismiss-tooltip-alignment="right"
          data-id=${item.id}
          type=${item.type}
          text=${item.label}
          size="md"
        >
        </cds-dismissible-tag>
      `;

    case "button":
      return html`
        <cds-button kind="ghost" size="md" @click=${() => item.onClick?.(item)}>
          ${item.label}
        </cds-button>
      `;

    case "icon-button":
    default:
      return html`
        <div style="block-size: 40px; inline-size: 40px;">
          <cds-button
          kind="ghost"
          size="md"
          tooltip-text=${item.label}
          tooltip-position="right"
          @click=${() => item.onClick?.(item)}
        >
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            slot="icon"
            fill="currentColor"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"></path>
          </svg>
        </cds-button>
        </div>
      `;
  }
}
// type=${hiddenItems[0]?.type || "gray"}
function overflowRenderer(hiddenItems: any[]) {
  switch (OVERFLOW_VARIANT) {
    case "tag":
      return html`
        <cds-tag
          @click=${() => console.log(hiddenItems)}
          type="gray"
          size=${hiddenItems[0]?.size || "md"}
        >
          +${hiddenItems.length}
        </cds-tag>
      `;

    case "operational-tag":
      return html`
        <cds-popover
          caret
          align="bottom-right"
          autoalign
          highcontrast
          autoalign-boundary="#left"
        >
          <cds-operational-tag
            style="user-select: none;"
            @cds-operational-tag-selected=${(e: any) => {
              let isSelected = e.target.selected;
              const pop = e.target?.closest("cds-popover");
              requestAnimationFrame(() => {
                if (pop) pop.open = isSelected || false;
              });
            }}
            type="gray"
            text="+${hiddenItems.length}"
            size=${hiddenItems[0]?.size || "md"}
          ></cds-operational-tag>
          <cds-popover-content>
            <div style="padding: 1rem; font-size: 14px;">
              ${hiddenItems
                .slice(0, 10)
                .map((item) => html` <div>${item.label}</div> `)}
              ${hiddenItems.length > 10
                ? html`<button @click=${()=> console.log(hiddenItems)} style="padding: 0; outline: none; border: none; background: transparent; color: var(--cds-link-inverse); cursor: pointer; margin-top: 0.4rem;">View all (${hiddenItems.length})</button>`
                : ""}
            </div>
          </cds-popover-content>
        </cds-popover>
      `;

    case "button":
      return html`
        <cds-icon-button
          @click=${() => console.log("Hidden:", hiddenItems)}
          align="left"
          kind="ghost"
          size=${hiddenItems[0]?.size || "md"}
        >
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            fill="currentColor"
            slot="icon"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="8" r="2"></circle>
            <circle cx="16" cy="16" r="2"></circle>
            <circle cx="16" cy="24" r="2"></circle>
            <title>Overflow menu vertical</title>
          </svg>
          <span slot="tooltip-content">+${hiddenItems.length}</span>
        </cds-icon-button>
      `;

    case "icon-button":
      return html`
      <div style="block-size: 40px; inline-size: 40px;">
        <cds-icon-button
          @click=${() => console.log("Hidden:", hiddenItems)}
          align="left"
          kind="ghost"
          size="md"
        >
          <svg
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
            fill="currentColor"
            slot="icon"
            width="16"
            height="16"
            viewBox="0 0 32 32"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="8" r="2"></circle>
            <circle cx="16" cy="16" r="2"></circle>
            <circle cx="16" cy="24" r="2"></circle>
            <title>Overflow menu vertical</title>
          </svg>
          <span slot="tooltip-content">+${hiddenItems.length}</span>
        </cds-icon-button>
        </div>
      `;

    case "overflow-menu":
      return html`<cds-overflow-menu size="md" index="1" kind="ghost">
        <svg
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="cds--overflow-menu__icon"
          slot="icon"
          width="16"
          height="16"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <circle cx="16" cy="8" r="2"></circle>
          <circle cx="16" cy="16" r="2"></circle>
          <circle cx="16" cy="24" r="2"></circle>
        </svg>
        <span slot="tooltip-content"> Options </span>
        <cds-overflow-menu-body flipped>
          ${hiddenItems.map(
            (item) => html` <cds-overflow-menu-item
              @click=${() => item.onClick?.(item)}
              >${item.label}</cds-overflow-menu-item
            >`
          )}
        </cds-overflow-menu-body>
      </cds-overflow-menu> `;

    default:
      return html``;
  }
}

// Wait for full load so external Carbon web-component modules are registered
window.addEventListener("DOMContentLoaded", () => {
  const components = document.querySelectorAll("overflow-wc");
  const itemCountInput = document.querySelector("cds-number-input") as any;
  const popovers = document.querySelectorAll("cds-popover");

  const themeSelect = document.querySelector(
    'cds-select[label-text="Theme"]'
  ) as any;
  const itemRendererSelect = document.querySelector(
    'cds-select[label-text="Item Renderer"]'
  ) as any;
  const overflowRendererSelect = document.querySelector(
    'cds-select[label-text="Overflow Renderer"]'
  ) as any;

  const getSelectValue = (sel: any) => {
    if (!sel) return null;
    // try element's value first, fallback to attribute or selected child
    return (
      sel.value ??
      sel.getAttribute?.("value") ??
      sel.querySelector?.("cds-select-item[selected]")?.getAttribute("value") ??
      null
    );
  };

  const STORAGE_KEY = "overflow-wc-config";

  const saveState = (state: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const updateItems = () => {
    const raw =
      itemCountInput?.value ?? itemCountInput?.getAttribute?.("value");
    const count = parseInt(raw || "0", 10) || 0;
    components.forEach((component: any) => {
      component.items = createItems(count);
      component.itemRenderer = itemRenderer;
      component.overflowRenderer = overflowRenderer;
    });
    // persist count
    const cur = loadState() || {};
    cur.count = count;
    saveState(cur);
  };

  // initialize state from controls or persisted storage
  const initVals = () => {
    const persisted = loadState();

    const iv = persisted?.itemVariant ?? getSelectValue(itemRendererSelect);
    if (
      iv &&
      ["tag", "dismissable-tag", "button", "icon-button"].includes(iv)
    ) {
      ITEM_VARIANT = iv as ItemVariant;
      // try to update select UI
      try {
        if (itemRendererSelect) {
          itemRendererSelect.value = iv;
          itemRendererSelect.setAttribute?.("value", iv);
          const child = itemRendererSelect.querySelector?.(
            `cds-select-item[value="${iv}"]`
          );
          if (child) {
            itemRendererSelect
              .querySelectorAll?.("cds-select-item[selected]")
              ?.forEach((c: any) => c.removeAttribute("selected"));
            child.setAttribute("selected", "");
          }
        }
      } catch {}
    }

    const ov =
      persisted?.overflowVariant ?? getSelectValue(overflowRendererSelect);
    if (ov) {
      OVERFLOW_VARIANT = ov as OverflowVariant;
      try {
        if (overflowRendererSelect) {
          overflowRendererSelect.value = ov;
          overflowRendererSelect.setAttribute?.("value", ov);
          const child = overflowRendererSelect.querySelector?.(
            `cds-select-item[value="${ov}"]`
          );
          if (child) {
            overflowRendererSelect
              .querySelectorAll?.("cds-select-item[selected]")
              ?.forEach((c: any) => c.removeAttribute("selected"));
            child.setAttribute("selected", "");
          }
        }
      } catch {}
    }

    const theme = persisted?.theme ?? getSelectValue(themeSelect);
    if (theme) {
      document.body.className = `cds-theme-zone-${theme}`;
      try {
        if (themeSelect) {
          themeSelect.value = theme;
          themeSelect.setAttribute?.("value", theme);
          const child = themeSelect.querySelector?.(
            `cds-select-item[value="${theme}"]`
          );
          if (child) {
            themeSelect
              .querySelectorAll?.("cds-select-item[selected]")
              ?.forEach((c: any) => c.removeAttribute("selected"));
            child.setAttribute("selected", "");
          }
        }
      } catch {}
    }

    const persistedCount = persisted?.count;
    if (typeof persistedCount === "number") {
      try {
        if (itemCountInput) {
          itemCountInput.setAttribute?.("value", String(persistedCount));
          itemCountInput.value = String(persistedCount);
        }
      } catch {}
    }
  };

  // wire up events
  if (itemCountInput) {
    // Carbon's number input emits a custom event; listen to both the custom event and standard events
    itemCountInput.addEventListener("cds-number-input", (e: any) => {
      updateItems();
      // if detail has value, persist it
      const v = e?.detail?.value ?? e?.detail?.valueAsNumber;
      if (typeof v !== "undefined") {
        const cur = loadState() || {};
        cur.count = parseInt(String(v), 10) || cur.count || 0;
        saveState(cur);
      }
    });
    itemCountInput.addEventListener("change", updateItems as EventListener);
    itemCountInput.addEventListener("input", updateItems as EventListener);
  }

  itemRendererSelect?.addEventListener("cds-select-selected", () => {
    const v = getSelectValue(itemRendererSelect);
    if (v) {
      ITEM_VARIANT = v as ItemVariant;
      const cur = loadState() || {};
      cur.itemVariant = ITEM_VARIANT;
      saveState(cur);
      updateItems();
    }
  });

  overflowRendererSelect?.addEventListener("cds-select-selected", () => {
    const v = getSelectValue(overflowRendererSelect);
    if (v) {
      OVERFLOW_VARIANT = v as OverflowVariant;
      const cur = loadState() || {};
      cur.overflowVariant = OVERFLOW_VARIANT;
      saveState(cur);
      updateItems();
    }
  });

  themeSelect?.addEventListener("cds-select-selected", () => {
    const t = getSelectValue(themeSelect);
    if (t) {
      document.body.className = `cds-theme-zone-${t}`;
      const cur = loadState() || {};
      cur.theme = t;
      saveState(cur);
    }
  });

  popovers.forEach((popover) =>
    popover.addEventListener("click", (e) => e.stopPropagation())
  );

  initVals();
  requestAnimationFrame(() => {
    updateItems();
  });
});
