import { describe, it, expect } from 'vitest';
import { COLUMN_MENU_SECTIONS, assembleColumnMenu } from '../src/lib/column_menu.js';

const item = (label) => ({ label, action: () => {} });
const sections = {
  pin: [item('Pin left'), item('Pin right')],
  autosize: [item('Autosize this column')],
  group: [item('Group by Name')],
  pivot: [item('Pivot by Name')],
  aggregate: [],
  visibility: [item('Hide column')],
};
const labels = (items) => items.map((i) => (i === 'separator' ? '|' : i.label));

describe('assembleColumnMenu', () => {
  it('shows every section by default, group and pivot together', () => {
    expect(labels(assembleColumnMenu(sections))).toEqual([
      'Pin left', 'Pin right', '|', 'Autosize this column', '|', 'Group by Name', 'Pivot by Name', '|', 'Hide column',
    ]);
  });

  it('keeps only the enabled sections, without stray separators', () => {
    expect(labels(assembleColumnMenu(sections, ['pin', 'autosize', 'visibility']))).toEqual([
      'Pin left', 'Pin right', '|', 'Autosize this column', '|', 'Hide column',
    ]);
    expect(labels(assembleColumnMenu(sections, ['pivot', 'visibility']))).toEqual(['Pivot by Name', '|', 'Hide column']);
  });

  it('follows the canonical order whatever order sections are listed in', () => {
    expect(labels(assembleColumnMenu(sections, ['visibility', 'pin']))).toEqual(['Pin left', 'Pin right', '|', 'Hide column']);
  });

  it('is empty when the menu is turned off', () => {
    expect(assembleColumnMenu(sections, [])).toEqual([]);
  });

  it('lists the sections', () => {
    expect(COLUMN_MENU_SECTIONS).toEqual(['pin', 'autosize', 'group', 'pivot', 'aggregate', 'visibility']);
  });
});
