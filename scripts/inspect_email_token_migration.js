const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || '';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const q = `SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name='subscriptions' AND column_name IN ('emailToken','updatedAt');`;
    console.log('\n--- QUERY ---\n' + q);
    const r = await client.query(q);
    console.log(JSON.stringify(r.rows, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
