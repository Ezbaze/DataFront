# Search

The sidebar search supports an advanced query language across most views. It replaces plain “substring-only” matching when the query is valid.

## Basics

- **Free text** matches the current view’s typical text fields.
  - Example: `missile silo`
- **Key/value filters** use `key:value`.
  - Example: `user:ezbaze`
- **Boolean logic**: `AND`, `OR` (case-insensitive).
  - Example: `team:2 AND clan:nu`
- **Negation**: `NOT` or a leading `-`.
  - Example: `NOT clan:nu` or `-clan:nu`
- **Grouping / nesting**: use parentheses `(...)`.
  - Example: `user:ez AND (clan:nu OR team:2)`
- **Implicit AND**: whitespace behaves like `AND`.
  - Example: `user:ez clan:nu` is the same as `user:ez AND clan:nu`
- **Quotes**: use `"` to include spaces in a value.
  - Example: `source:"Action Warn when missile silos are built [a1]"`
- **Comparisons**: prefix the value with `<`, `<=`, `>`, `>=`, `=`, or `!=` for numeric keys/facets.
  - Example: `tiles:>=10` or `troops:<500`
- **Ranges**: use `min..max` for numeric keys/facets (inclusive), including open-ended `..max` and `min..`.
  - Example: `tiles:10..20`, `tiles:..20`, `tiles:10..`

## Important behaviors

- Search is **case-insensitive**.
- Search applies even for **1 character**.
- If the query is **invalid** (bad syntax), DataFront **falls back to plain substring search** instead of erroring.
- Unknown keys like `foo:bar` simply **match nothing** (but can still be used in `OR` expressions).
- For `troops` comparisons/ranges, the query uses the **same troop units shown in the UI**.

## Keys by view

### Players / Clanmates / Teams

- `user:` / `player:`: player name or id
- `publicid:`: public player id (the one the site logs as “Your player ID is …”)
- `clan:`: player clan (supports `[TAG]` parsed from the player name)
- `team:`: player team
- Numeric keys (comparisons supported): `tiles`, `gold`, `troops`, `expansions`, `incoming`, `outgoing`, `alliances`, `supports`
- `text:` / `message:`: same as free text
- `id:`: player id

Examples:

- `clan:nu team:2`
- `player:alice OR player:bob`

Note on grouped views (`Clanmates`, `Teams`):

- Search matches individual players; group summary totals remain the full group totals.
- Group headers show `matches/total` and auto-expand while a search is active.

### Ships

- `owner:` / `user:`: ship owner name or owner id
- `type:`: ship type (`Transport`, `Trade Ship`, `Warship`)
- `status:`: derived status text (e.g. `retreating`, `arrived`, `idle`, `en route`)
- `origin:` / `current:` / `destination:`: coordinate text (e.g. `12, 34`)
- Numeric keys (comparisons supported): `troops` (and `id` if it’s numeric)
- `text:` / `message:`: same as free text
- `id:`: ship id

Examples:

- `owner:alice status:retreating`
- `destination:"12, 34" AND type:transport`

### Logs

Logs support searching the “mention pills” (chips).

- `user:` / `player:`: matches player mention pills by label or id
- `clan:`: matches clan mention pills by label or id, and can also match player pills via facets
- `team:`: matches team mention pills by label or id, and can also match player pills via facets
- `level:`: `debug|info|warn|error`
- `source:`: logger source string
- `text:` / `message:`: message text plus token labels/text
- `id:`: log entry id
- Numeric keys (comparisons supported): `timestamp` / `time` (milliseconds since epoch)

Custom facets:

- Mention pills can optionally expose extra facets (e.g. `role`, `unitType`). Any `key:value` can match against token facets when present.
- Numeric comparisons also work against facets when the facet values are numbers (e.g. `score:>=100`).

Examples:

- `level:warn AND (team:2 OR clan:nu)`
- `source:"Action Log troop donations"`

### Actions / Running Actions

- `name:` / `action:`: action name
- `desc:` / `description:`: action description
- `mode:` / `runMode:`: `once|continuous|event`
- `enabled:`: boolean (`true/false`, also accepts `1/0`, `yes/no`, `on/off`)
- Running actions only:
  - `status:`: `running|completed|stopped|failed`
- `text:` / `message:`: same as free text
- `id:`: action id (running actions also match `run.id` / `run.actionId`)
- Numeric keys (comparisons supported): `interval`, `created`, `updated` (actions), plus `started`/`updated` (running actions)

Examples:

- `enabled:true AND mode:event`
- `status:running AND action:"Log troop donations"`
