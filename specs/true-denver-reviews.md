# True Denver Reviews - Colorado favorites and ratings

Initial specifications for Claude.

## Requirements

Create an interactive web app for reviews of local restaurants and places of interest.

Use a local database that can be uploaded with the site. I would like to use DuckDB to manage it, but if there are good reasons to prefer another format please suggest that. This should be an open source format.

For now, do not consider deployment and hosting.

### Fields

- Name
- Description
- Category (see Categories)
- Cuisine (see Cuisines) (optional)
- Address (optional) (linkable to Google Maps)
- Area (see Areas) (optional)
- Closed (Boolean) (defaults to false)
- Rating (see Rating system)

### Areas

Include all Denver neighborhoods, such as RiNo.

Include other major cities in Colorado.

### Categories

These should be normalized; they may change.

- Restaurant
- Bar
- Club
- Venue
- Bakery
- Coffee
- Hot springs
- Shopping
- Event

### Cuisines

These should be normalized; they may change.

- Mexican
- Chinese
- Japanese
- Greek
- American
- Italian

### Rating system (best to worst)

- Heart emoji
- Two thumbs up emojis
- One thumbs up emoji
- Pinching hand emoji
- Thumbs down emoji

Also allow a NULL default (not yet rated).

## Technologies

- Node.js / npm
- TypeScript
  - Modern browsers only
- Vite
  - Vitest
- React
- React Testing Library
- ESLint
- Prettier
  - single quotes

## Constraints

- Accessible
- MIT license compatible
- Database will only be updated externally (read-only from site's perspective)

## Other considerations

- Add a .gitattributes using best practices, assuming initial development will be on macOS
- Add an .editorconfig
- Add an .nvmrc
