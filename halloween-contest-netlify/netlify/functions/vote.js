import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  try {
    const { pin, contestantId, scores } = await req.json();
    if (!pin || !contestantId || !scores) {
      return new Response(JSON.stringify({ error: 'Missing fields.' }), { status: 400 });
    }

    const store = getStore({ name: 'halloween-votes' });
    const judges = await store.getJSON('judges');
    if (!judges?.pins?.includes(pin)) {
      return new Response(JSON.stringify({ error: 'Invalid judge PIN.' }), { status: 401 });
    }

    const votesBlob = await store.getJSON('votes');
    if (!votesBlob) {
      return new Response(JSON.stringify({ error: 'Contest not initialized. Visit /init first.' }), { status: 500 });
    }

    // Prevent multiple ballots from the same PIN
    if (votesBlob.ballots[pin]) {
      return new Response(JSON.stringify({ error: 'This PIN has already submitted a ballot.' }), { status: 400 });
    }

    votesBlob.votes.push({ pin, contestantId, scores, ts: Date.now() });
    votesBlob.ballots[pin] = true;

    await store.setJSON('votes', votesBlob);

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
