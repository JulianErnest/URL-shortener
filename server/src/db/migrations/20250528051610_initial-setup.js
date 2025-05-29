/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema
    // URLs table - Core functionality
    .createTable('urls', function(table) {
      table.increments('id').primary();
      table.string('original_url').notNullable();
      table.string('short_code', 8).notNullable().unique();
      table.string('custom_alias').nullable();
      table.jsonb('utm_parameters').nullable();
      table.timestamp('expires_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Link Preview table - Custom preview metadata
    .createTable('link_previews', function(table) {
      table.increments('id').primary();
      table.integer('url_id').unsigned().references('id').inTable('urls').onDelete('CASCADE');
      // Open Graph metadata
      table.string('og_title').nullable();
      table.string('og_description').nullable();
      table.string('og_image').nullable();
      table.string('og_type').nullable();
      // Custom colors
      table.string('theme_color').nullable();
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
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema
    .dropTableIfExists('clicks')
    .dropTableIfExists('link_previews')
    .dropTableIfExists('urls');
};
