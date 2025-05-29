/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema
    // URLs table - Core functionality
    .createTable('urls', function(table) {
      table.increments('id').primary();
      table.text('original_url').notNullable();
      table.string('short_code', 8).notNullable().unique();
      table.string('custom_alias').nullable();
      table.jsonb('utm_parameters').nullable();
      table.jsonb('preview').nullable(); // Add preview JSONB column here
      table.timestamp('expires_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Clicks table - Analytics
    .createTable('clicks', function(table) {
      table.increments('id').primary();
      table.integer('url_id').unsigned().references('id').inTable('urls').onDelete('CASCADE');
      table.string('ip_address').nullable();
      table.string('user_agent').nullable();
      table.string('referrer').nullable();
      table.timestamp('clicked_at').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema
    .dropTableIfExists('clicks')
    .dropTableIfExists('urls');
};