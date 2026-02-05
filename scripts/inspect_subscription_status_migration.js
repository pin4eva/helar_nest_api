const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || 'postgres://0c3fb87ee4d3434062ad439345d84a680eda7d4b7aa0693c2a6c29ce1790796d:sk_RO6AA9GsEXx6W6jmyKYFo@db.prisma.io:5432/helar_dev?sslmode=require';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const queries = [
      `SELECT id, migration_name, checksum, started_at, finished_at, applied_steps_count, logs FROM "_prisma_migrations" WHERE migration_name = '20251207193824_subscription_status';`,
      `SELECT column_name, is_nullable, column_default, data_type FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='status';`,
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='subscriptions' AND indexname='subscriptions_status_idx';`
    ];

    for (const q of queries) {
      console.log('\n--- QUERY ---\n' + q);
      const res = await client.query(q);
      console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
