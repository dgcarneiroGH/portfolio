import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quantizeTopTwo, hexToRgb, buildRgbBuffer } from './generate-palettes.mjs';

test('quantizeTopTwo: devuelve los 2 colores dominantes por frecuencia', () => {
  // 4x4: 8 px rojos (255,0,0) + 8 px azules (0,0,255)
  const raw = buildRgbBuffer([
    ...Array(8).fill([255, 0, 0]),
    ...Array(8).fill([0, 0, 255])
  ]);
  const result = quantizeTopTwo(raw, 4, 4);
  assert.equal(result.length, 2);
  assert.equal(result[0], '#ff0000');
  assert.equal(result[1], '#0000ff');
});

test('quantizeTopTwo: con un solo color devuelve un único hex', () => {
  const raw = buildRgbBuffer(Array(16).fill([16, 32, 48]));
  const result = quantizeTopTwo(raw, 4, 4);
  assert.deepEqual(result, ['#102030']);
});

test('quantizeTopTwo: agrupa tonos cercanos en el mismo bucket de 4 bits', () => {
  const raw = buildRgbBuffer([
    ...Array(12).fill([255, 0, 0]),
    ...Array(2).fill([0, 255, 0]),
    ...Array(2).fill([0, 0, 255])
  ]);
  const result = quantizeTopTwo(raw, 4, 4);
  assert.equal(result.length, 2);
  assert.equal(result[0], '#ff0000');
});

test('quantizeTopTwo: desempata por media del bucket, no por el primer pixel', () => {
  // 8 px entre (250,10,10) y (255,0,0) → media ~ (252,5,5) → '#fc0505'
  const raw = buildRgbBuffer([
    ...Array(4).fill([250, 10, 10]),
    ...Array(4).fill([255, 0, 0]),
    ...Array(8).fill([0, 0, 255])
  ]);
  const result = quantizeTopTwo(raw, 4, 4);
  assert.equal(result[0], '#fd0505');
  assert.equal(result[1], '#0000ff');
});

test('hexToRgb y viceversa son consistentes', () => {
  assert.deepEqual(hexToRgb('#10ff00'), [16, 255, 0]);
});
