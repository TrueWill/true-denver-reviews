#!/bin/bash
set -e
if [ ! -f db/addresses.json ]; then
  echo "db/addresses.json not found. Run the lookup script first." >&2
  exit 1
fi
found=$(duckdb -noheader -c "SELECT count(*) FROM (SELECT unnest(results) AS r FROM read_json_auto('db/addresses.json')) WHERE r.status = 'found';")
echo "Merging $found addresses into db/places.csv..."
duckdb -c "COPY (
  SELECT p.id, p.name, p.description, p.category, p.cuisine,
         COALESCE(a.address, p.address) AS address,
         p.area, p.closed, p.rating
  FROM read_csv('db/places.csv', header=true, all_varchar=true) p
  LEFT JOIN (
    SELECT r.id, r.address
    FROM (SELECT unnest(results) AS r FROM read_json_auto('db/addresses.json'))
    WHERE r.status = 'found'
  ) a ON p.id::INTEGER = a.id
  ORDER BY p.id::INTEGER
) TO 'db/places.csv' (HEADER, DELIMITER ',');"
echo "Done. Run 'npm run seed' to rebuild the database."
