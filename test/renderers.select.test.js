// @vitest-environment jsdom
//
// The `select` renderer's popover editor: inactive options, search, and
// keeping the cell's own value visible.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { select } from '../src/lib/renderers.js';

afterEach(() => { document.body.replaceChildren(); });

const PEOPLE = [
  { value: 'u1', label: 'Ana' },
  { value: 'u2', label: 'Ben' },
  { value: 'u3', label: 'Cleo (left)', inactive: true },
];

function open(value, options = PEOPLE, config = {}) {
  const td = document.createElement('td');
  const row = { id: 1, owner: value };
  const col = { field: 'owner', cellRendererConfig: { options, clearable: true, ...config } };
  const api = { applyTransaction: vi.fn() };
  const grid = document.createElement('div');
  grid.setAttribute('data-controller', 'grid');
  grid.append(td);
  document.body.append(grid);
  const ctx = { value, row, col, td, api };
  td.append(select()(ctx));
  td.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  const pop = document.querySelector('.sg-renderer-select-popover');
  const labels = () => [...pop.querySelectorAll('.sg-renderer-select-list button')].map((b) => b.textContent.trim());
  return { pop, labels, row, api, td };
}

describe('select editor', () => {
  it('labels a cell with an inactive option', () => {
    const td = document.createElement('td');
    const node = select()({ value: 'u3', row: { owner: 'u3' }, col: { field: 'owner', cellRendererConfig: { options: PEOPLE } }, td });
    expect(node.textContent).toBe('Cleo (left)');
  });

  it('hides inactive options until Show all is ticked', () => {
    const { pop, labels } = open('u1', PEOPLE, { inactiveLabel: 'Show former users' });
    expect(labels()).toEqual(['(none)', 'Ana', 'Ben']);
    const toggle = pop.querySelector('.sg-renderer-select-toggle');
    expect(toggle.textContent.trim()).toBe('Show former users');
    const box = toggle.querySelector('input');
    box.checked = true;
    box.dispatchEvent(new Event('change'));
    expect(labels()).toEqual(['(none)', 'Ana', 'Ben', 'Cleo (left)']);
  });

  it("keeps the cell's own inactive value in the list", () => {
    const { labels } = open('u3');
    expect(labels()).toEqual(['(none)', 'Ana', 'Ben', 'Cleo (left)']);
  });

  it('has no toggle or search for a short list of active options', () => {
    const { pop } = open('u1', PEOPLE.slice(0, 2));
    expect(pop.querySelector('.sg-renderer-select-toggle')).toBeNull();
    expect(pop.querySelector('.sg-renderer-select-search')).toBeNull();
  });

  it('searches long lists and Enter picks the first match', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ value: `v${i}`, label: `Person ${i}` }));
    const { pop, labels, row, api } = open(null, many);
    const search = pop.querySelector('.sg-renderer-select-search');
    expect(document.activeElement).toBe(search);
    search.value = 'person 1';
    search.dispatchEvent(new Event('input'));
    expect(labels()).toEqual(['Person 1', 'Person 10', 'Person 11']);
    search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(row.owner).toBe('v1');
    expect(api.applyTransaction).toHaveBeenCalled();
    expect(document.querySelector('.sg-renderer-select-popover')).toBeNull();
  });
});
