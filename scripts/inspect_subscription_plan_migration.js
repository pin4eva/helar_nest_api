const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || '';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const queries = [
      `SELECT id, migration_name, checksum, started_at, finished_at, applied_steps_count, logs FROM "_prisma_migrations" WHERE migration_name = '20251208080627_subscription_plan';`,
      `SELECT to_regclass('public.subscription_plans') AS subscription_plans, to_regclass('public.subscriptions') AS subscriptions;`,
      `SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='plan';`,
      `SELECT enum_range(NULL::\"PlanIntervalEnum\") AS plan_interval_values;`,
      `SELECT indexname, indexdef FROM pg_indexes WHERE tablename='subscription_plans';`
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
