import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'inline script exists');
const head = script.slice(script.indexOf('var VERSION='), script.indexOf('var state,mode,')) +
  script.slice(script.indexOf('function options('), script.indexOf('function validDraft('));
const ctx = {};
vm.runInNewContext(head, ctx);

assert.equal(ctx.VERSION, 'V2.1');
assert.equal(ctx.TASKS.length, 12);
for (let group = 0; group < 4; group++) {
  assert.equal(ctx.TASKS.slice(group * 3, group * 3 + 3).reduce((n, t) => n + t.points, 0), 25);
}
for (const formula of ['1,4-C6H4(CH3)2', '1,4-C₆H₄(CH₃)₂', 'p-CH3C6H4CH3', '对-C6H4(CH3)2', '4,1-(CH3)2C6H4']) {
  assert.equal(ctx.formulaOK(5, formula), true, formula);
}
for (const formula of ['C6H4(CH3)2', 'CH3C6H4CH3', '1,2-C6H4(CH3)2', 'm-C6H4(CH3)2', 'C8H10', '1,4-C6H5CH3']) {
  assert.equal(ctx.formulaOK(5, formula), false, formula);
}
assert.match(ctx.formulaFeedback(5, 'C6H4(CH3)2'), /邻、间/);
assert.match(ctx.formulaFeedback(5, 'm-C6H4(CH3)2'), /间位/);
assert.equal(ctx.evaluate(5, {ring:['CH3',null,null,'CH3',null,null],choices:{formula:'1,4-C6H4(CH3)2'}}).length, 0);
assert.equal(ctx.evaluate(5, {ring:[null,'CH3',null,null,'CH3',null],choices:{formula:'p-CH3C6H4CH3'}}).length, 0);
assert.equal(ctx.evaluate(5, {ring:['CH3','CH3',null,null,null,null],choices:{formula:'1,4-C6H4(CH3)2'}})[0].key, 'ring');
assert.match(ctx.TASKS[9].evidence, /A 瓶/);
assert.match(ctx.TASKS[10].evidence, /B 瓶/);

console.log('Logic checks passed: 4×25 points, para notation, ring rotation, lab instructions.');
