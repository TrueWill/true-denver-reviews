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

-- ── Categories ────────────────────────────────────────────────────────────────
INSERT INTO categories VALUES
  (1, 'Restaurant'),
  (2, 'Bar'),
  (3, 'Coffee Shop'),
  (4, 'Bakery'),
  (5, 'Food Truck'),
  (6, 'Brewery'),
  (7, 'Cocktail Bar'),
  (8, 'Diner'),
  (9, 'Market');

-- ── Cuisines ──────────────────────────────────────────────────────────────────
INSERT INTO cuisines VALUES
  (1, 'American'),
  (2, 'Mexican'),
  (3, 'Italian'),
  (4, 'Asian'),
  (5, 'Mediterranean'),
  (6, 'BBQ');

-- ── Areas ─────────────────────────────────────────────────────────────────────
INSERT INTO areas VALUES
  -- Denver neighborhoods
  (1,  'RiNo'),
  (2,  'Capitol Hill'),
  (3,  'LoDo'),
  (4,  'Highland'),
  (5,  'Washington Park'),
  (6,  'Five Points'),
  (7,  'Baker'),
  (8,  'LoHi'),
  (9,  'Central Park'),
  (10, 'Sloan''s Lake'),
  (11, 'Cherry Creek'),
  (12, 'City Park'),
  (13, 'Cheesman Park'),
  (14, 'Congress Park'),
  (15, 'Curtis Park'),
  (16, 'Cole'),
  (17, 'Whittier'),
  (18, 'Globeville'),
  (19, 'Elyria-Swansea'),
  (20, 'Sunnyside'),
  (21, 'Jefferson Park'),
  (22, 'Edgewater'),
  (23, 'Berkeley'),
  (24, 'Regis'),
  (25, 'West Colfax'),
  (26, 'Villa Park'),
  (27, 'Sun Valley'),
  (28, 'Lincoln Park'),
  (29, 'Golden Triangle'),
  (30, 'Auraria'),
  (31, 'Union Station'),
  (32, 'Ballpark'),
  (33, 'Five Points / Welton'),
  (34, 'North Capitol Hill'),
  (35, 'Country Club'),
  (36, 'Speer'),
  (37, 'Alamo Placita'),
  (38, 'Platt Park'),
  (39, 'Harvard Gulch'),
  (40, 'Rosedale'),
  (41, 'University'),
  (42, 'University Hills'),
  (43, 'Virginia Village'),
  (44, 'South Park Hill'),
  (45, 'Park Hill'),
  (46, 'Montbello'),
  (47, 'Green Valley Ranch'),
  (48, 'Stapleton'),
  (49, 'Northfield'),
  (50, 'Lowry'),
  -- Colorado Springs
  (51, 'Colorado Springs'),
  -- Front Range cities
  (52, 'Boulder'),
  (53, 'Fort Collins'),
  (54, 'Aurora'),
  (55, 'Lakewood'),
  (56, 'Pueblo'),
  (57, 'Loveland'),
  (58, 'Greeley'),
  (59, 'Longmont'),
  (60, 'Arvada'),
  (61, 'Westminster'),
  (62, 'Englewood'),
  (63, 'Littleton'),
  (64, 'Centennial'),
  (65, 'Thornton'),
  (66, 'Northglenn'),
  (67, 'Broomfield'),
  (68, 'Brighton'),
  (69, 'Commerce City'),
  -- Mountain towns
  (70, 'Aspen'),
  (71, 'Vail'),
  (72, 'Breckenridge'),
  (73, 'Steamboat Springs'),
  (74, 'Telluride'),
  (75, 'Estes Park'),
  (76, 'Grand Junction'),
  (77, 'Durango');

-- ── Sample Places ─────────────────────────────────────────────────────────────
INSERT INTO places VALUES
  (1,  'Mercantile Dining & Provision',
       'Alex Seidel''s farm-to-table gem inside Union Station. The ricotta is life-changing.',
       1, 1, '1701 Wynkoop St, Denver, CO 80202', 31, false, 5),

  (2,  'Tacos Tequila Whiskey',
       'Lively spot for creative tacos and an excellent margarita selection. Cash friendly patio.',
       1, 2, '1514 York St, Denver, CO 80206', 45, false, 4),

  (3,  'Work & Class',
       'Tiny, loud, and absolutely worth it. The lamb neck and oxtail are standouts.',
       1, 1, '2500 Larimer St, Denver, CO 80205', 1, false, 5),

  (4,  'El Chapultepec',
       'Historic jazz bar and dive that survived for 80+ years. Sadly closed in 2020.',
       2, 2, '1962 Market St, Denver, CO 80202', 3, true, 5),

  (5,  'Snooze, an A.M. Eatery',
       'Lines out the door for a reason. The pancake flight is essential Denver brunch.',
       8, 1, '2262 Larimer St, Denver, CO 80205', 1, false, 4),

  (6,  'Crema Coffee House',
       'Indie roaster with excellent espresso and a cozy vibe on a quiet Curtis Park block.',
       3, NULL, '2862 Welton St, Denver, CO 80205', 6, false, 4),

  (7,  'Linger',
       'Rooftop bar in a converted mortuary. Creative global small plates, stunning views.',
       1, 5, '2030 W 30th Ave, Denver, CO 80211', 4, false, 4),

  (8,  'Little Man Ice Cream',
       'The 28-foot-tall cream can is iconic. Salted Oreo and Honey Lavender are top picks.',
       9, NULL, '2620 16th St, Denver, CO 80211', 4, false, 5),

  (9,  'Biker Jim''s Gourmet Dogs',
       'Reindeer dogs, elk jalapeño, cream cheese — truly unique cart-turned-restaurant.',
       5, 1, '2148 Larimer St, Denver, CO 80205', 1, false, 4),

  (10, 'Corinne',
       'Beautiful all-day dining at SCP Denver. Excellent cocktails and a cool crowd.',
       7, 1, '1700 E 17th Ave, Denver, CO 80218', 2, false, 4),

  (11, 'Denver Central Market',
       'Packed food hall in RiNo with top-notch vendors. Best for weekend browsing.',
       9, NULL, '2669 Larimer St, Denver, CO 80205', 1, false, 4),

  (12, 'The Bindery',
       'Neighborhood gem in LoHi with rotating seasonal menus and great natural wine list.',
       1, 5, '1817 Central St, Denver, CO 80211', 8, false, 5),

  (13, 'Illegal Pete''s',
       'Mission-style burritos and a cold beer — reliable Boulder import now all over Denver.',
       1, 2, '1530 16th St, Denver, CO 80202', 3, false, 3),

  (14, 'Root Down',
       'LoHi stalwart in a converted gas station. Strong vegetarian options, fun cocktails.',
       1, 5, '1600 W 33rd Ave, Denver, CO 80211', 8, false, 4),

  (15, 'Ophelia''s Electric Soapbox',
       'Brass tacks burlesque venue meets actually-good restaurant. Weird and wonderful.',
       1, 1, '1215 20th St, Denver, CO 80202', 3, false, 3),

  (16, 'Hop Alley',
       'Modern Chinese-American spot from Daniel Asher. The dumplings and Sichuan wings are must-orders.',
       1, 4, '3500 Larimer St, Denver, CO 80205', 1, false, 5),

  (17, 'Mici Handcrafted Italian',
       'Fast-casual Neapolitan pizza done right. Crispy crust, quality toppings.',
       1, 3, '10001 E Iliff Ave, Denver, CO 80247', 54, false, 3),

  (18, 'Comida',
       'Colorful Mexican counter-service with great tortas and green chile.',
       1, 2, '2406 W 32nd Ave, Denver, CO 80211', 4, false, 4),

  (19, 'Zuni Street Brewing',
       'Neighborhood brewery in Jefferson Park with solid IPAs and a dog-friendly patio.',
       6, NULL, '2355 W 29th Ave, Denver, CO 80211', 21, false, 3),

  (20, 'Avanti F&B',
       'Multi-vendor food hall with rotating concepts, great cocktails, and a rooftop vibe.',
       9, NULL, '3200 Pecos St, Denver, CO 80211', 4, false, 4),

  (21, 'Rosenberg''s Bagels',
       'New York–style bagels done better than most NYC spots. Get the everything with lox.',
       4, NULL, '725 E 26th Ave, Denver, CO 80205', 34, false, 5),

  (22, 'Super Mega Bien',
       'Jennifer Jasinski''s tribute to Latin America. Inventive cocktails, bold flavors.',
       7, 2, '1260 25th St, Denver, CO 80205', 1, false, 4),

  (23, 'Los Cabos Mexican Grill',
       'Family spot in a strip mall — do not judge. The green chile smothered burrito is top-tier.',
       1, 2, '3300 E Colfax Ave, Denver, CO 80206', 45, false, 4),

  (24, 'Uncle',
       'Fantastic ramen spot on Tennyson. The shoyu broth is deeply satisfying.',
       1, 4, '2215 W 32nd Ave, Denver, CO 80211', 4, false, 4),

  (25, 'Steuben''s',
       'American comfort food classics done with care. Great pie and the lobster roll is legit.',
       8, 1, '523 E 17th Ave, Denver, CO 80203', 2, false, 4);
