// netlify/functions/init.js
import { getStore } from '@netlify/blobs';

const DEFAULT_CONFIG = {
  eventName: 'Spoopy Costume Contest 2025',
  scoring: { scaleMin: 1, scaleMax: 10 },
  categories: [
    { id: 'craft', name: 'Craftsmanship' },
    { id: 'theme', name: 'Theme/Concept' },
    { id: 'wow', name: 'Wow Factor' },
    { id: 'stage', name: 'Stage Presence' }
  ],
  contestants: [
    { id: 'c1', name: 'Vampire Vicki', number: 1 },
    { id: 'c2', name: 'Zombie Zack', number: 2 },
    { id: 'c3', name: 'Pumpkin Piper', number: 3 },
    { id: 'c4', name: 'Ghostly Gina', number: 4 }
  ]
};
const DEFAULT_JUDGES = { pins: ['1234','2345','3456','4567','5678'] };

export default async (req) => {
  try {
    const store = getStore({ name: 'halloween-votes' });

    // Try to fetch from your deployed site first
    let config = DEFAULT_CONFIG;
    let judges = DEFAULT_JUDGES;

    try {
      const origin = new URL(req.url); // e.g. https://YOUR-SITE/.netlify/functions/init
      origin.pathname = '/assets/config.json';
      const cfgRes = await fetch(origin.toString());
      if (cfgRes.ok) config = await cfgRes.json();

      origin.pathname = '/assets/judges.json';
      const jRes = await fetch(origin.toString());
      if (jRes.ok) judges = await jRes.json();
    } catch (e) {
      // If fetch fails, we’ll fall back to defaults
      console.log('init: falling back to defaults:', e);
    }

    await store.setJSON('config', config);
    await store.setJSON('judges', judges);
    await store.setJSON('votes', { ballots: {}, votes: [] });

    return new Response(JSON.stringify({ ok: true, message: 'Initialized config & empty votes.' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.log('init error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
};
