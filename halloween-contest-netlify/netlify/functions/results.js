import { getStore } from '@netlify/blobs';

export default async (req, context) => {
  try {
    const store = getStore({ name: 'halloween-votes' });
    const config = await store.getJSON('config');
    const votesBlob = await store.getJSON('votes');

    if (!config || !votesBlob) {
      return new Response(JSON.stringify({ error: 'Not initialized.' }), { status: 500 });
    }

    const { categories, contestants } = config;
    const { votes } = votesBlob;

    // Aggregate
    const catIndex = Object.fromEntries(categories.map(c => [c.id, c]));
    const contIndex = Object.fromEntries(contestants.map(c => [c.id, c]));

    const sums = {}; // contestantId -> total
    const byCat = {}; // catId -> { contestantId -> sum }
    for (const c of contestants) { sums[c.id] = 0; }
    for (const cat of categories) { byCat[cat.id] = Object.fromEntries(contestants.map(c=>[c.id,0])); }

    for (const v of votes) {
      for (const [catId, val] of Object.entries(v.scores)) {
        if (byCat[catId] && contIndex[v.contestantId]) {
          byCat[catId][v.contestantId] += Number(val) || 0;
          sums[v.contestantId] += Number(val) || 0;
        }
      }
    }

    const overall = Object.entries(sums).map(([cid, total]) => ({
      id: cid,
      total,
      name: contIndex[cid].name,
      number: contIndex[cid].number
    })).sort((a,b)=> b.total - a.total);

    const byCategory = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      rows: Object.entries(byCat[cat.id]).map(([cid, score]) => ({
        id: cid,
        name: contIndex[cid].name,
        number: contIndex[cid].number,
        score
      })).sort((a,b)=> b.score - a.score)
    }));

    return new Response(JSON.stringify({
      eventName: config.eventName,
      ballots: Object.keys(votesBlob.ballots).length,
      overall,
      byCategory
    }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
