-- Regenerate public/data.db from CSV source files.
-- Edit db/places.csv in any spreadsheet app, then run: npm run seed
--
-- Lookup tables (categories, cuisines, areas) are in their own CSVs
-- and rarely need editing.
--
-- NOTES:
--   name      is required
--   category  is required; must match db/categories.csv
--   cuisine   is optional (leave blank if unknown); must match db/cuisines.csv
--   address   is optional (leave blank if unknown)
--   area      is optional (leave blank if unknown); must match db/areas.csv
--   closed    is optional (blank means open); TRUE or FALSE when set
--   rating    is optional (leave blank if unrated); must be 1–5 when set
--
-- The seed fails, listing every bad row, if any of these rules are broken.

SELECT error(
  'db/places.csv has invalid rows:' || chr(10) ||
  string_agg('  ' || place || ': ' || problem, chr(10) ORDER BY place, problem)
)
FROM (
  WITH p AS (
    SELECT coalesce(name, '(missing name)') AS place, *
    FROM read_csv('db/places.csv', header = true, all_varchar = true)
  )
  SELECT place, 'missing name' AS problem FROM p WHERE name IS NULL
  UNION ALL
  SELECT place, 'missing category' FROM p WHERE category IS NULL
  UNION ALL
  SELECT place, 'unknown category "' || category || '"' FROM p
  WHERE category NOT IN (SELECT name FROM read_csv('db/categories.csv', header = true))
  UNION ALL
  SELECT place, 'unknown cuisine "' || cuisine || '"' FROM p
  WHERE cuisine NOT IN (SELECT name FROM read_csv('db/cuisines.csv', header = true))
  UNION ALL
  SELECT place, 'unknown area "' || area || '"' FROM p
  WHERE area NOT IN (SELECT name FROM read_csv('db/areas.csv', header = true))
  UNION ALL
  SELECT place, 'invalid closed "' || closed || '"' FROM p
  WHERE upper(closed) NOT IN ('TRUE', 'FALSE')
  UNION ALL
  SELECT place, 'rating "' || rating || '" is not a whole number 1–5' FROM p
  WHERE rating NOT IN ('1', '2', '3', '4', '5')
)
HAVING count(*) > 0;

-- Pin the storage format so the older DuckDB WASM bundle can read the file.
-- It must be set on ATTACH; DuckDB 2.x ignores SET storage_compatibility_version
-- for a database file that is already open.
ATTACH 'public/data.db' AS data (STORAGE_VERSION 'v1.3.2');
USE data;

DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS areas;

CREATE TABLE categories AS
  SELECT row_number() OVER (ORDER BY src.name)::INTEGER AS id, src.name::VARCHAR AS name
  FROM read_csv('db/categories.csv', header = true) src;

CREATE TABLE cuisines AS
  SELECT row_number() OVER (ORDER BY src.name)::INTEGER AS id, src.name::VARCHAR AS name
  FROM read_csv('db/cuisines.csv', header = true) src;

CREATE TABLE areas AS
  SELECT row_number() OVER (ORDER BY src.name)::INTEGER AS id, src.name::VARCHAR AS name
  FROM read_csv('db/areas.csv', header = true) src;

CREATE TABLE places AS
  SELECT
    row_number() OVER (ORDER BY p.name)::INTEGER     AS id,
    p.name::VARCHAR                                  AS name,
    COALESCE(p.description, '')::VARCHAR AS description,
    c.id::INTEGER                        AS category_id,
    cu.id::INTEGER                       AS cuisine_id,
    NULLIF(p.address,  '')::VARCHAR      AS address,
    a.id::INTEGER                        AS area_id,
    p.closed::BOOLEAN                    AS closed,
    p.rating::INTEGER                    AS rating
  FROM read_csv('db/places.csv', header = true) p
  JOIN      categories c  ON c.name = p.category
  LEFT JOIN cuisines   cu ON cu.name = p.cuisine
  LEFT JOIN areas       a ON  a.name = p.area;

SELECT
  CASE WHEN count(*) = 0
    THEN error('No places imported — check that all category names in places.csv match categories.csv')
    ELSE count(*)
  END AS imported_places
FROM places;
