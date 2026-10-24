import { describe, it } from 'node:test';
import assert from 'node:assert';
import { FAMOUS_STATIONS, MULTIPLAYER_TRIVIA, CURIOSITY_CARDS } from '../src/lib/games-engine.ts';

describe('VIBE Multiplayer Games Engine & Rules', () => {
  it('FAMOUS_STATIONS contains verified Indian railway junctions', () => {
    assert.ok(FAMOUS_STATIONS.length >= 40, 'Should have at least 40 famous stations');
    const delhi = FAMOUS_STATIONS.find(s => s.name === 'DELHI');
    const howrah = FAMOUS_STATIONS.find(s => s.name === 'HOWRAH');
    const mumbai = FAMOUS_STATIONS.find(s => s.name === 'MUMBAI');

    assert.ok(delhi, 'DELHI must be in station database');
    assert.strictEqual(delhi.code, 'NDLS');
    assert.ok(howrah, 'HOWRAH must be in station database');
    assert.strictEqual(howrah.code, 'HWH');
    assert.ok(mumbai, 'MUMBAI must be in station database');
  });

  it('Station Antakshari letter-chaining rules work correctly', () => {
    // DELHI ends in 'I'
    const word1 = 'DELHI';
    const lastLetter1 = word1[word1.length - 1];
    assert.strictEqual(lastLetter1, 'I');

    // Matching station starting with 'I'
    const matchI = FAMOUS_STATIONS.filter(s => s.name.startsWith(lastLetter1));
    assert.ok(matchI.length > 0, 'Should find stations starting with I (e.g. INDORE, ITSI)');
    assert.ok(matchI.some(s => s.name === 'INDORE'));

    // INDORE ends in 'E'
    const word2 = 'INDORE';
    const lastLetter2 = word2[word2.length - 1];
    assert.strictEqual(lastLetter2, 'E');

    const matchE = FAMOUS_STATIONS.filter(s => s.name.startsWith(lastLetter2));
    assert.ok(matchE.length > 0, 'Should find stations starting with E (e.g. ETAWAH, ERNAKULAM)');
  });

  it('Trivia Question Bank contains well-formed questions and valid indices', () => {
    assert.ok(MULTIPLAYER_TRIVIA.length >= 5, 'Should have at least 5 trivia questions');
    for (const q of MULTIPLAYER_TRIVIA) {
      assert.ok(q.id, 'Question must have id');
      assert.ok(q.question.length > 10, 'Question text must be substantial');
      assert.ok(q.options.length === 4, 'Question must have exactly 4 options');
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, 'correctIndex must be in range 0-3');
      assert.ok(q.explanation.length > 15, 'Explanation must be meaningful');
    }
  });

  it('Chenab Bridge trivia has correct world record attribution', () => {
    const chenabQ = MULTIPLAYER_TRIVIA.find(q => q.question.includes('359 metres'));
    assert.ok(chenabQ, 'Must have Chenab Arch Bridge question');
    assert.strictEqual(chenabQ.options[chenabQ.correctIndex], 'Chenab Arch Bridge');
  });

  it('Curiosity cards deck contains deep icebreakers and follow-ups', () => {
    assert.ok(CURIOSITY_CARDS.length >= 5, 'Should have at least 5 curiosity cards');
    for (const card of CURIOSITY_CARDS) {
      assert.ok(card.id, 'Card must have ID');
      assert.ok(card.prompt.includes('?'), 'Prompt should ask a question');
      assert.ok(card.followUp.length > 10, 'Follow-up must be present');
    }
  });
});
