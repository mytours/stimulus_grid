// The header right-click menu is built from named sections. `columnMenu`
// (data-grid-column-menu-value) picks which sections show, in this order:
//
//   pin        Pin left / Pin right / Unpin
//   autosize   Autosize this column / Autosize all columns
//   group      Group by / Ungroup
//   pivot      Pivot by / Remove from pivot
//   aggregate  Aggregate: sum|avg|count|min|max, Remove aggregation
//   visibility Hide column / Show all columns
//
// An empty list turns the menu off, leaving the browser's own context menu.
export const COLUMN_MENU_SECTIONS = ['pin', 'autosize', 'group', 'pivot', 'aggregate', 'visibility'];

// Sections whose items run together, with no separator between them.
const JOINED = { pivot: 'group' };

// sections: { name: [item, ...] }; enabled: section names to keep.
// Returns the menu items with a 'separator' between the kept, non-empty
// sections (in COLUMN_MENU_SECTIONS order).
export function assembleColumnMenu(sections, enabled = COLUMN_MENU_SECTIONS) {
  const keep = new Set(enabled);
  const items = [];
  let last = null;
  for (const name of COLUMN_MENU_SECTIONS) {
    const section = keep.has(name) ? (sections[name] || []) : [];
    if (!section.length) continue;
    if (items.length && JOINED[name] !== last) items.push('separator');
    items.push(...section);
    last = name;
  }
  return items;
}
