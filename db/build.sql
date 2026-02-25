-- Regenerate public/data.db from CSV source files.
-- Edit db/places.csv in any spreadsheet app, then run: npm run seed
--
-- Lookup tables (categories, cuisines, areas) are in their own CSVs
-- and rarely need editing.
--
-- NOTES:
--   category  is required; misspelled names will silently drop the row
--   cuisine   is optional (leave blank if unknown)
--   address   is optional (leave blank if unknown)
--   area      is optional (leave blank if unknown)
--   rating    is optional (leave blank if unrated); must be 1–5 when set

DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cuisines;
DROP TABLE IF EXISTS areas;

CREATE TABLE categories AS
  SELECT id::INTEGER AS id, name::VARCHAR AS name
  FROM read_csv('db/categories.csv', header = true);

CREATE TABLE cuisines AS
  SELECT id::INTEGER AS id, name::VARCHAR AS name
  FROM read_csv('db/cuisines.csv', header = true);

CREATE TABLE areas AS
  SELECT id::INTEGER AS id, name::VARCHAR AS name
  FROM read_csv('db/areas.csv', header = true);

CREATE TABLE places AS
  SELECT
    p.id::INTEGER                        AS id,
    p.name::VARCHAR                      AS name,
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

-- Warn about any rows silently dropped due to unrecognized category
SELECT 'WARNING: unrecognized category for: ' || p.name AS warning
FROM read_csv('db/places.csv', header = true) p
WHERE p.category NOT IN (SELECT name FROM categories);

SELECT count(*) AS imported_places FROM places;
