const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || 'postgres://0c3fb87ee4d3434062ad439345d84a680eda7d4b7aa0693c2a6c29ce1790796d:sk_RO6AA9GsEXx6W6jmyKYFo@db.prisma.io:5432/helar_dev?sslmode=require';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const queries = [
      `SELECT id, migration_name, checksum, started_at, finished_at, applied_steps_count, logs FROM "_prisma_migrations" WHERE id = 'bd90c2f7-7b30-49f5-a08f-bd7eb50a584c';`,
      `SELECT id, migration_name, checksum, started_at, finished_at, applied_steps_count, logs FROM "_prisma_migrations" WHERE migration_name ILIKE '%payments%';`,
      `SELECT to_regclass('public.payment_transactions') AS payment_transactions, to_regclass('public.organization_subscriptions') AS organization_subscriptions, to_regclass('public.subscriptions') AS subscriptions;`,
      `SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='subscriptions' AND column_name IN ('providerSubscriptionId','status','autoRenew');`,
      `SELECT enum_range(NULL::\"SubscriptionStatusEnum\") as subscription_status_enum_values;`,
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='subscriptions';`,
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='payment_transactions';`,
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='organization_subscriptions';`
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
