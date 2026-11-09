'use strict';
const bands = [
  [899, '254,76,97'], [1199, '243,156,17'], [1599, '255,193,22'],
  [1999, '83,196,26'], [2399, '19,194,194'], [2699, '52,152,219'],
  [3099, '156,61,207'], [4000, '14,29,105'],
];
function valid(value) {
  return (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)))
    && Number.isInteger(Number(value)) && Number(value) >= 800 && Number(value) <= 4000;
}
function render(value) {
  if (!valid(value)) return '<span class="hardness-unrated">—</span>';
  const n = Number(value);
  return `<span class="hydro-hardness" style="color:rgb(${bands.find(([max]) => n <= max)[1]});font-weight:700">${n}</span>`;
}
module.exports = { bands, valid, render };
