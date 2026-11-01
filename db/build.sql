-- Regenerate public/places.json from CSV source files.
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
) AS validation_errors
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

-- Column names and types match the Place type in src/types/index.ts.
-- The names in places.csv are already validated above, so no lookup joins are needed.
CREATE TEMP TABLE places AS
  SELECT
    row_number() OVER (ORDER BY name)::INTEGER AS id,
    name,
    coalesce(description, '') AS description,
    category,
    cuisine,
    address,
    area,
    coalesce(closed::BOOLEAN, false) AS closed,
    rating::INTEGER AS rating
  FROM read_csv('db/places.csv', header = true, all_varchar = true);

SELECT
  CASE WHEN count(*) = 0
    THEN error('No places imported — db/places.csv has no rows')
    ELSE count(*)
  END AS imported_places
FROM places;

COPY (SELECT * FROM places ORDER BY id)
TO 'public/places.json' (FORMAT json, ARRAY true);
