import assert from 'node:assert/strict';
import test from 'node:test';
import {
    authorIdFrom,
    badgeKey,
    classifyInlineCode,
    guessLang,
    highlightFastExpr,
    looksLikeFastExpr,
    normalizeFollowedIds,
} from '../src/content/support/communityEnhanceCore.mjs';

test('guessLang detects python, json and fastplus snippets', () => {
    assert.equal(guessLang('import fastplus\nalpha = 1'), 'python');
    assert.equal(guessLang("{'matrix': ['close']}"), 'json');
    assert.equal(guessLang('const x = () => 1'), 'javascript');
    assert.equal(guessLang('hello world'), '');
});

test('highlightFastExpr colors BRAIN operators, fields and fastplus APIs', () => {
    const html = highlightFastExpr('a=ts_delay(close, 5); group_rank(a, industry)');
    assert.match(html, /wqp-ce-op">ts_delay</);
    assert.match(html, /wqp-ce-field">close</);
    assert.match(html, /wqp-ce-op">group_rank</);
    assert.match(html, /wqp-ce-field">industry</);
    assert.match(html, /hljs-number">5</);
});

test('looksLikeFastExpr recognizes expression strings but not prose', () => {
    assert.equal(looksLikeFastExpr('ts_delay(close, 5)'), true);
    assert.equal(looksLikeFastExpr('hello consultant'), false);
});

test('classifyInlineCode maps platform chips', () => {
    assert.equal(classifyInlineCode('fastplus'), 'api');
    assert.equal(classifyInlineCode('ts_delay'), 'op');
    assert.equal(classifyInlineCode('close'), 'field');
    assert.equal(classifyInlineCode('hello'), '');
});

test('authorIdFrom only accepts consultant IDs', () => {
    assert.equal(authorIdFrom('SZ83096 ★'), 'SZ83096');
    assert.equal(authorIdFrom('7 days ago'), '');
    assert.equal(authorIdFrom('Edited'), '');
});

test('badgeKey and follow-id normalization', () => {
    assert.equal(badgeKey('Gold Consultant'), 'gold');
    assert.equal(badgeKey('Staff'), 'staff');
    assert.deepEqual(normalizeFollowedIds([' SZ83096 ', 'sz83096', '', 'KH94146']), ['sz83096', 'kh94146']);
});
