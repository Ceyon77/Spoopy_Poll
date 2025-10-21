import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore({ name: 'halloween-votes' });

    // Seed config from the deployed static files (public/assets/*.json)
    // On Netlify, we can fetch them via absolute path from the deployed URL.
    // In netlify dev, this also works.
    const baseUrl = new URL(req.url);
    baseUrl.pathname = '/assets/config.json';
    const cfgRes = await fetch(baseUrl.toString());
    const config = await cfgRes.json();

    const judgesUrl = new URL(req.url);
    judgesUrl.pathname = '/assets/judges.json';
    const jRes = await fetch(judgesUrl.toString());
    const judges = await jRes.json();

    // Save
    await store.setJSON('config', config);
    await store.setJSON('judges', judges);
    await store.setJSON('votes', {
      // Structure:
      // ballots: { [pin]: true }  // used pins
      // votes: [{ pin, contestantId, scores: {catId: number} }]
      ballots: {},
      votes: []
    });

    return new Response(JSON.stringify({ ok: true, message: 'Initialized config & empty votes.' }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
