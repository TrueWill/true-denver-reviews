#!/bin/bash
set -e
if [ ! -f db/areas-lookup.json ]; then
  echo "db/areas-lookup.json not found. Run the lookup script first." >&2
  exit 1
fi
found=$(duckdb -noheader -c "SELECT count(*) FROM (SELECT unnest(results) AS r FROM read_json_auto('db/areas-lookup.json')) WHERE r.status = 'found';")
echo "Merging $found areas into db/places.csv..."
duckdb -c "COPY (
  SELECT p.name, p.description, p.category, p.cuisine,
         p.address,
         COALESCE(a.area, p.area) AS area,
         p.closed, p.rating
  FROM read_csv('db/places.csv', header=true, all_varchar=true) p
  LEFT JOIN (
    SELECT r.name, r.area
    FROM (SELECT unnest(results) AS r FROM read_json_auto('db/areas-lookup.json'))
    WHERE r.status = 'found'
  ) a ON p.name = a.name
  ORDER BY p.name
) TO 'db/places.csv' (HEADER, DELIMITER ',');"
echo "Done. Run 'npm run seed' to rebuild the database."
