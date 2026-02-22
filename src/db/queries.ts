import type { AsyncDuckDBConnection } from './client';
import type { Place } from '../types';

export async function fetchAllPlaces(conn: AsyncDuckDBConnection): Promise<Place[]> {
  const result = await conn.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      c.name  AS category,
      cu.name AS cuisine,
      p.address,
      a.name  AS area,
      p.closed,
      p.rating
    FROM places p
    JOIN categories c  ON c.id = p.category_id
    LEFT JOIN cuisines cu ON cu.id = p.cuisine_id
    LEFT JOIN areas a     ON a.id  = p.area_id
    ORDER BY p.name
  `);

  return result.toArray().map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    description: String(row.description ?? ''),
    category: String(row.category),
    cuisine: row.cuisine != null ? String(row.cuisine) : null,
    address: row.address != null ? String(row.address) : null,
    area: row.area != null ? String(row.area) : null,
    closed: Boolean(row.closed),
    rating: row.rating != null ? (Number(row.rating) as Place['rating']) : null,
  }));
}

export async function fetchCategories(conn: AsyncDuckDBConnection): Promise<string[]> {
  const result = await conn.query('SELECT name FROM categories ORDER BY name');
  return result.toArray().map((row) => String(row.name));
}

export async function fetchCuisines(conn: AsyncDuckDBConnection): Promise<string[]> {
  const result = await conn.query('SELECT name FROM cuisines ORDER BY name');
  return result.toArray().map((row) => String(row.name));
}

export async function fetchAreas(conn: AsyncDuckDBConnection): Promise<string[]> {
  const result = await conn.query('SELECT name FROM areas ORDER BY name');
  return result.toArray().map((row) => String(row.name));
}
