/* eslint-disable */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from 'url';
import promptSync from "prompt-sync";
import slugify from "@sindresorhus/slugify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prompt = promptSync({ sigint: true });

const migrationName = prompt("Enter name for migration: ");

// Remove spaces from migration name and replace with hyphens
const formattedMigrationName = slugify(migrationName);

execSync(
  `npx knex migrate:make --knexfile ${path.join(__dirname, "./knexfile.js")} ${formattedMigrationName}`,
  { stdio: "inherit" },
);
