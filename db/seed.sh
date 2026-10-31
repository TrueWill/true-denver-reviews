#!/bin/bash
set -e
echo "Running duckdb with init file..."
duckdb -init db/build.sql :memory: "SELECT 'Seed complete' as status;"
echo "Done. File size:"
ls -lh public/places.json
echo "Verifying data:"
duckdb :memory: "SELECT count(*) AS places FROM 'public/places.json';"
