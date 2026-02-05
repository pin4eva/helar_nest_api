const { Client } = require('pg');
(async () => {
  const connectionString = process.env.PRODUCTION_DATABASE_URL || 'postgres://0c3fb87ee4d3434062ad439345d84a680eda7d4b7aa0693c2a6c29ce1790796d:sk_RO6AA9GsEXx6W6jmyKYFo@db.prisma.io:5432/helar_dev?sslmode=require';
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const queries = [
      `SELECT id, migration_name, started_at, finished_at, logs FROM "_prisma_migrations" WHERE migration_name IN ('20251208101134_plancode','20251208101253_plancode','20251208103419_plancode','20251214165042_email_token') ORDER BY migration_name;`,
      `SELECT column_name, is_nullable, data_type, column_default FROM information_schema.columns WHERE table_name='subscriptions' AND column_name IN ('planId','planCode','subscriptionPlanId');`,
      `SELECT conname, conrelid::regclass AS table, pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid = 'subscriptions'::regclass AND contype IN ('f') ORDER BY conname;`,
      `SELECT to_regclass('public.email_tokens') AS email_tokens;`,
      `SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='email_tokens';`
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
