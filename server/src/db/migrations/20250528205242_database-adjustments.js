/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.createTable('urls', (table) => {
    table.increments('id').primary();
    table.string('original_url').notNullable();
    table.string('custom_code').unique();
    table.timestamp('expires_at');
    table.jsonb('preview'); // stores title, description, imageUrl
    table.jsonb('utm_parameters'); // array of { key, value }
    table.timestamps(true, true);
  });

  await knex.schema.createTable('analytics', (table) => {
    table.increments('id').primary();
    table.integer('url_id').unsigned().references('id').inTable('urls').onDelete('CASCADE');
    table.string('ip_address');
    table.string('user_agent');
    table.string('referrer');
    table.timestamp('clicked_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.dropTableIfExists('analytics');
  await knex.schema.dropTableIfExists('urls');
};
