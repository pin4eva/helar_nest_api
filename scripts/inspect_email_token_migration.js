const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || 'postgres://0c3fb87ee4d3434062ad439345d84a680eda7d4b7aa0693c2a6c29ce1790796d:sk_RO6AA9GsEXx6W6jmyKYFo@db.prisma.io:5432/helar_dev?sslmode=require';
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
