#!/bin/bash
set -e
echo "PWD: $(pwd)"
echo "Removing old db..."
rm -f public/data.db
echo "Running duckdb with init file..."
duckdb -init db/build.sql public/data.db "SELECT 'Seed complete' as status;"
echo "Done. File size:"
ls -lh public/data.db
echo "Verifying data:"
duckdb public/data.db "SELECT count(*) FROM places;"
