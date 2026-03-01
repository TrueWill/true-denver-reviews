#!/usr/bin/env bash
# Dump public/data.db to SQL matching the original seed.sql format.
# Usage: bash db/dump.sh > output.sql
set -euo pipefail

DB="${1:-public/data.db}"

# Run a SQL query against the DB and return undecorated list output
q() {
  duckdb "$DB" -noheader -list -c "$1"
}

# Add commas between rows; terminate the last row with a semicolon
rows() {
  awk 'NR>1{print prev","} {prev=$0} END{if(NR>0)print prev";"}'
}

cat << 'EOF'
-- Drop tables if they exist (to allow re-running)
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS areas;

-- Lookup tables
CREATE TABLE categories (
  id   INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE cuisines (
  id   INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE areas (
  id   INTEGER PRIMARY KEY,
  name VARCHAR NOT NULL
);

-- Main table
CREATE TABLE places (
  id          INTEGER PRIMARY KEY,
  name        VARCHAR NOT NULL,
  description VARCHAR NOT NULL DEFAULT '',
  category_id INTEGER NOT NULL REFERENCES categories(id),
  cuisine_id  INTEGER REFERENCES cuisines(id),
  address     VARCHAR,
  area_id     INTEGER REFERENCES areas(id),
  closed      BOOLEAN NOT NULL DEFAULT false,
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5)
);
EOF

echo ""
echo "-- ── Categories ────────────────────────────────────────────────────────────────"
echo "INSERT INTO categories VALUES"
q "SELECT '  (' || id::VARCHAR || ',' || CASE WHEN id < 10 THEN '  ' ELSE ' ' END || '''' || replace(name, '''', '''''') || ''''  || ')'
   FROM categories ORDER BY id" | rows

echo ""
echo "-- ── Cuisines ──────────────────────────────────────────────────────────────────"
echo "INSERT INTO cuisines VALUES"
q "SELECT '  (' || id::VARCHAR || ',' || CASE WHEN id < 10 THEN '  ' ELSE ' ' END || '''' || replace(name, '''', '''''') || '''' || ')'
   FROM cuisines ORDER BY id" | rows

echo ""
echo "-- ── Areas ─────────────────────────────────────────────────────────────────────"
echo "INSERT INTO areas VALUES"
q "SELECT '  (' || id::VARCHAR || ',' || CASE WHEN id < 10 THEN '  ' ELSE ' ' END || '''' || replace(name, '''', '''''') || '''' || ')'
   FROM areas ORDER BY id" | rows

echo ""
echo "-- ── Places ───────────────────────────────────────────────────────────────────"
echo "-- Rating key: 5 = loved, 4 = really good, 3 = good, 2 = meh, 1 = bad"
echo "-- Parsed from personal reviews; duplicates merged (higher rating kept, descriptions combined)"
echo "INSERT INTO places VALUES"
q "SELECT
  '  (' ||
  id::VARCHAR || ', ' ||
  '''' || replace(name,        '''', '''''') || '''' || ', ' ||
  '''' || replace(description, '''', '''''') || '''' || ', ' ||
  category_id::VARCHAR || ', ' ||
  CASE WHEN cuisine_id IS NULL THEN 'NULL' ELSE cuisine_id::VARCHAR END || ', ' ||
  CASE WHEN address    IS NULL THEN 'NULL' ELSE '''' || replace(address, '''', '''''') || '''' END || ', ' ||
  CASE WHEN area_id    IS NULL THEN 'NULL' ELSE area_id::VARCHAR END || ', ' ||
  CASE WHEN closed THEN 'true' ELSE 'false' END || ', ' ||
  CASE WHEN rating IS NULL THEN 'NULL' ELSE rating::VARCHAR END ||
  ')'
FROM places ORDER BY id" | rows
