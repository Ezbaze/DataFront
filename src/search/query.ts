import type {
  PlayerRecord,
  ShipRecord,
  SidebarActionDefinition,
  SidebarLogEntry,
  SidebarLogToken,
  SidebarRunningAction,
} from "../types";
import { extractClanTag } from "../utils";

function normalizeTroopCountForSearch(rawTroops: number): number {
  if (!Number.isFinite(rawTroops)) {
    return 0;
  }
  return Math.floor(Math.max(rawTroops, 0) / 10);
}

export type SearchQueryAst =
  | { type: "and"; left: SearchQueryAst; right: SearchQueryAst }
  | { type: "or"; left: SearchQueryAst; right: SearchQueryAst }
  | { type: "not"; expr: SearchQueryAst }
  | { type: "term"; term: SearchQueryTerm };

export type SearchQueryTerm =
  | { type: "freeText"; value: string }
  | { type: "keyValue"; key: string; value: string }
  | { type: "compare"; key: string; op: CompareOp; value: number }
  | { type: "range"; key: string; min?: number; max?: number };

export type CompareOp = ">" | ">=" | "<" | "<=" | "=" | "!=";

export type SearchQueryCompileResult =
  | { ok: true; ast: SearchQueryAst }
  | { ok: false; error: SearchQueryError };

export interface SearchQueryError {
  message: string;
  index: number;
}

type TokenizeResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; error: SearchQueryError };

type Token =
  | { type: "lparen"; index: number }
  | { type: "rparen"; index: number }
  | { type: "colon"; index: number }
  | { type: "not"; index: number }
  | { type: "word"; index: number; value: string }
  | { type: "quoted"; index: number; value: string }
  | { type: "eof"; index: number };

function isPrimaryStart(token: Token): boolean {
  return (
    token.type === "not" ||
    token.type === "lparen" ||
    token.type === "word" ||
    token.type === "quoted"
  );
}

function tokenize(input: string): TokenizeResult {
  const tokens: Token[] = [];
  let i = 0;

  const error = (message: string, index: number): TokenizeResult => ({
    ok: false,
    error: { message, index },
  });

  while (i < input.length) {
    const ch = input[i];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ type: "lparen", index: i });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen", index: i });
      i += 1;
      continue;
    }
    if (ch === ":") {
      tokens.push({ type: "colon", index: i });
      i += 1;
      continue;
    }
    if (ch === "-") {
      const prev = i === 0 ? " " : input[i - 1];
      const next = input[i + 1];
      const precededByBoundary =
        i === 0 ||
        prev === " " ||
        prev === "\t" ||
        prev === "\n" ||
        prev === "\r" ||
        prev === "(";
      const looksLikeNegation =
        next === "(" ||
        next === '"' ||
        (typeof next === "string" && /[a-zA-Z_]/.test(next));
      if (precededByBoundary && looksLikeNegation) {
        tokens.push({ type: "not", index: i });
        i += 1;
        continue;
      }
    }
    if (ch === '"') {
      const start = i;
      i += 1;
      let value = "";
      let closed = false;
      while (i < input.length) {
        const qch = input[i];
        if (qch === '"') {
          i += 1;
          tokens.push({ type: "quoted", index: start, value });
          value = "";
          closed = true;
          break;
        }
        if (qch === "\\") {
          const next = input[i + 1];
          if (next === undefined) {
            return error("Unterminated escape sequence", i);
          }
          if (next === '"' || next === "\\" || next === "n" || next === "t") {
            value +=
              next === "n"
                ? "\n"
                : next === "t"
                  ? "\t"
                  : next === '"'
                    ? '"'
                    : "\\";
            i += 2;
            continue;
          }
          value += next;
          i += 2;
          continue;
        }
        value += qch;
        i += 1;
      }
      if (!closed) {
        return error("Unterminated quoted string", start);
      }
      continue;
    }

    const start = i;
    while (i < input.length) {
      const c = input[i];
      if (
        c === " " ||
        c === "\t" ||
        c === "\n" ||
        c === "\r" ||
        c === "(" ||
        c === ")" ||
        c === ":"
      ) {
        break;
      }
      i += 1;
    }
    const word = input.slice(start, i);
    if (!word) {
      return error("Unexpected character", start);
    }
    tokens.push({ type: "word", index: start, value: word });
  }

  tokens.push({ type: "eof", index: input.length });
  return { ok: true, tokens };
}

class Parser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return (
      this.tokens[this.index] ?? { type: "eof", index: this.tokens.length }
    );
  }

  private consume(): Token {
    const token = this.peek();
    this.index = Math.min(this.index + 1, this.tokens.length);
    return token;
  }

  private expect(
    type: Token["type"],
    message: string,
  ): { ok: true; token: Token } | { ok: false; error: SearchQueryError } {
    const token = this.peek();
    if (token.type !== type) {
      return { ok: false, error: { message, index: token.index } };
    }
    return { ok: true, token: this.consume() };
  }

  private matchOperator(op: "and" | "or"): boolean {
    const token = this.peek();
    return token.type === "word" && token.value.toLowerCase() === op;
  }

  parse(): SearchQueryCompileResult {
    const expr = this.parseOr();
    if (!expr.ok) {
      return expr;
    }
    const extra = this.peek();
    if (extra.type !== "eof") {
      return {
        ok: false,
        error: { message: "Unexpected token", index: extra.index },
      };
    }
    return { ok: true, ast: expr.ast };
  }

  private parseOr(): SearchQueryCompileResult {
    let left = this.parseAnd();
    if (!left.ok) {
      return left;
    }
    while (this.matchOperator("or")) {
      this.consume();
      const right = this.parseAnd();
      if (!right.ok) {
        return right;
      }
      left = {
        ok: true,
        ast: { type: "or", left: left.ast, right: right.ast },
      };
    }
    return left;
  }

  private parseAnd(): SearchQueryCompileResult {
    let left = this.parseNot();
    if (!left.ok) {
      return left;
    }
    while (true) {
      if (this.matchOperator("and")) {
        this.consume();
        const right = this.parseNot();
        if (!right.ok) {
          return right;
        }
        left = {
          ok: true,
          ast: { type: "and", left: left.ast, right: right.ast },
        };
        continue;
      }
      const next = this.peek();
      if (
        next.type === "eof" ||
        next.type === "rparen" ||
        this.matchOperator("or")
      ) {
        break;
      }
      if (isPrimaryStart(next)) {
        const right = this.parseNot();
        if (!right.ok) {
          return right;
        }
        left = {
          ok: true,
          ast: { type: "and", left: left.ast, right: right.ast },
        };
        continue;
      }
      break;
    }
    return left;
  }

  private parseNot(): SearchQueryCompileResult {
    const token = this.peek();
    if (
      token.type === "not" ||
      (token.type === "word" && token.value.toLowerCase() === "not")
    ) {
      this.consume();
      const expr = this.parseNot();
      if (!expr.ok) {
        return expr;
      }
      return { ok: true, ast: { type: "not", expr: expr.ast } };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): SearchQueryCompileResult {
    const token = this.peek();
    if (token.type === "lparen") {
      this.consume();
      const expr = this.parseOr();
      if (!expr.ok) {
        return expr;
      }
      const rparen = this.expect("rparen", "Expected ')'");
      if (!rparen.ok) {
        return rparen;
      }
      return expr;
    }
    return this.parseTerm();
  }

  private parseTerm(): SearchQueryCompileResult {
    const token = this.peek();
    if (token.type !== "word" && token.type !== "quoted") {
      return {
        ok: false,
        error: { message: "Expected search term", index: token.index },
      };
    }

    if (token.type === "word") {
      const next = this.tokens[this.index + 1];
      if (next?.type === "colon") {
        const keyToken = this.consume() as Extract<Token, { type: "word" }>;
        this.consume(); // colon
        const valueToken = this.peek();
        if (valueToken.type !== "word" && valueToken.type !== "quoted") {
          return {
            ok: false,
            error: {
              message: "Expected value after ':'",
              index: valueToken.index,
            },
          };
        }
        this.consume();
        const key = keyToken.value.toLowerCase();
        const compareOps = new Set([">", ">=", "<", "<=", "=", "!="]);
        let rawValue = valueToken.value;
        if (valueToken.type === "word" && compareOps.has(rawValue)) {
          const possibleNumberToken = this.peek();
          if (
            (possibleNumberToken.type === "word" ||
              possibleNumberToken.type === "quoted") &&
            Number.isFinite(Number(possibleNumberToken.value))
          ) {
            rawValue = `${rawValue} ${possibleNumberToken.value}`;
            this.consume();
          }
        }
        rawValue = this.maybeJoinRangeTokens(rawValue);
        const value = rawValue.toLowerCase();
        if (!value.trim()) {
          return {
            ok: false,
            error: {
              message: "Empty value is not allowed",
              index: valueToken.index,
            },
          };
        }
        const compare = parseCompareValue(value);
        if (compare.ok) {
          return {
            ok: true,
            ast: {
              type: "term",
              term: {
                type: "compare",
                key,
                op: compare.op,
                value: compare.value,
              },
            },
          };
        }
        if (compare.isCompareSyntax) {
          return {
            ok: false,
            error: { message: compare.errorMessage, index: valueToken.index },
          };
        }
        const range = parseRangeValue(value);
        if (range.ok) {
          return {
            ok: true,
            ast: {
              type: "term",
              term: { type: "range", key, min: range.min, max: range.max },
            },
          };
        }
        if (range.isRangeSyntax) {
          return {
            ok: false,
            error: { message: range.errorMessage, index: valueToken.index },
          };
        }
        return {
          ok: true,
          ast: { type: "term", term: { type: "keyValue", key, value } },
        };
      }
    }

    const consumed = this.consume() as Extract<
      Token,
      { type: "word" | "quoted" }
    >;
    const value = consumed.value.toLowerCase();
    if (!value.trim()) {
      return {
        ok: false,
        error: { message: "Empty term is not allowed", index: consumed.index },
      };
    }
    return {
      ok: true,
      ast: { type: "term", term: { type: "freeText", value } },
    };
  }

  private maybeJoinRangeTokens(rawValue: string): string {
    const looksNumeric = Number.isFinite(Number(rawValue));
    const next = this.peek();
    if (rawValue === "..") {
      if (
        (next.type === "word" && Number.isFinite(Number(next.value))) ||
        (next.type === "quoted" && Number.isFinite(Number(next.value)))
      ) {
        rawValue = `..${next.value}`;
        this.consume();
      }
      return rawValue;
    }

    if (rawValue.endsWith("..")) {
      if (
        (next.type === "word" && Number.isFinite(Number(next.value))) ||
        (next.type === "quoted" && Number.isFinite(Number(next.value)))
      ) {
        rawValue = `${rawValue}${next.value}`;
        this.consume();
      }
      return rawValue;
    }

    if (looksNumeric) {
      if (next.type === "word" && next.value === "..") {
        this.consume(); // consume the ".."
        const after = this.peek();
        if (
          (after.type === "word" && Number.isFinite(Number(after.value))) ||
          (after.type === "quoted" && Number.isFinite(Number(after.value)))
        ) {
          rawValue = `${rawValue}..${after.value}`;
          this.consume();
          return rawValue;
        }
        rawValue = `${rawValue}..`;
        return rawValue;
      }
      if (next.type === "word" && next.value.startsWith("..")) {
        rawValue = `${rawValue}${next.value}`;
        this.consume();
        return rawValue;
      }
    }

    return rawValue;
  }
}

export function compileSearchQuery(input: string): SearchQueryCompileResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      ok: true,
      ast: { type: "term", term: { type: "freeText", value: "" } },
    };
  }
  const tokenized = tokenize(trimmed);
  if (!tokenized.ok) {
    return { ok: false, error: tokenized.error };
  }
  const parser = new Parser(tokenized.tokens);
  return parser.parse();
}

export type SearchTarget =
  | { kind: "player"; player: PlayerRecord }
  | { kind: "ship"; ship: ShipRecord }
  | { kind: "log"; entry: SidebarLogEntry }
  | { kind: "action"; action: SidebarActionDefinition }
  | { kind: "runningAction"; run: SidebarRunningAction };

export function matchesSearchQuery(
  ast: SearchQueryAst,
  target: SearchTarget,
): boolean {
  switch (ast.type) {
    case "and":
      return (
        matchesSearchQuery(ast.left, target) &&
        matchesSearchQuery(ast.right, target)
      );
    case "or":
      return (
        matchesSearchQuery(ast.left, target) ||
        matchesSearchQuery(ast.right, target)
      );
    case "not":
      return !matchesSearchQuery(ast.expr, target);
    case "term":
      return matchesTerm(ast.term, target);
    default:
      return false;
  }
}

function includes(haystack: string, needle: string): boolean {
  if (!needle) {
    return true;
  }
  return haystack.includes(needle);
}

function parseBoolean(value: string): boolean | null {
  switch (value.trim().toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "y":
    case "on":
      return true;
    case "false":
    case "0":
    case "no":
    case "n":
    case "off":
      return false;
    default:
      return null;
  }
}

function logTokenText(tokens: SidebarLogToken[] | undefined): string {
  if (!tokens || tokens.length === 0) {
    return "";
  }
  return tokens
    .map((token) => (token.type === "text" ? token.text : (token.label ?? "")))
    .join(" ")
    .toLowerCase();
}

function logTokenMatchesType(
  tokens: SidebarLogToken[] | undefined,
  type: Exclude<SidebarLogToken["type"], "text">,
  value: string,
): boolean {
  if (!tokens || tokens.length === 0) {
    return false;
  }
  const needle = value.toLowerCase();
  for (const token of tokens) {
    if (token.type !== type) {
      continue;
    }
    const label = (token.label ?? "").toLowerCase();
    const id = (token.id ?? "").toLowerCase();
    if (includes(label, needle) || includes(id, needle)) {
      return true;
    }
  }
  return false;
}

function logTokenMatchesFacet(
  tokens: SidebarLogToken[] | undefined,
  key: string,
  value: string,
): boolean {
  if (!tokens || tokens.length === 0) {
    return false;
  }
  const needle = value.toLowerCase();
  const facetKey = key.toLowerCase();
  for (const token of tokens) {
    if (token.type === "text") {
      continue;
    }
    const facets = token.facets;
    if (!facets) {
      continue;
    }
    const facetValues = facets[facetKey];
    if (!facetValues || facetValues.length === 0) {
      continue;
    }
    for (const facetValue of facetValues) {
      if (includes(String(facetValue ?? "").toLowerCase(), needle)) {
        return true;
      }
    }
  }
  return false;
}

function formatTileSummaryForSearch(summary?: {
  x: number;
  y: number;
  ownerName?: string;
}): string {
  if (!summary) {
    return "";
  }
  const coords = `${summary.x}, ${summary.y}`;
  return summary.ownerName
    ? `${coords} (${summary.ownerName})`.toLowerCase()
    : coords.toLowerCase();
}

function deriveShipStatusForSearch(ship: ShipRecord): string {
  if (ship.retreating) {
    return "retreating";
  }
  if (ship.reachedTarget) {
    return "arrived";
  }
  if (ship.type === "Transport") {
    return "en route";
  }
  if (!ship.destination) {
    return ship.current ? "idle" : "unknown";
  }
  if (
    ship.current &&
    ship.destination &&
    ship.current.ref === ship.destination.ref
  ) {
    return "stationed";
  }
  return "en route";
}

function defaultTextForTarget(target: SearchTarget): string {
  switch (target.kind) {
    case "player": {
      const p = target.player;
      const derivedClanTag = extractClanTag(p.name);
      const clan = p.clan ?? derivedClanTag ?? "";
      const clanTag = clan ? `[${clan}]` : "";
      const fields = [p.name, p.id, p.team ?? "", clan, clanTag];
      return fields.join(" ").toLowerCase();
    }
    case "ship": {
      const s = target.ship;
      const label = `${s.type} #${s.id}`;
      const fields = [
        label,
        s.id,
        s.type,
        s.ownerName,
        s.ownerId,
        deriveShipStatusForSearch(s),
        formatTileSummaryForSearch(s.origin),
        formatTileSummaryForSearch(s.current),
        formatTileSummaryForSearch(s.destination),
      ];
      return fields.join(" ").toLowerCase();
    }
    case "log": {
      const e = target.entry;
      const fields = [
        e.id,
        e.level,
        e.source ?? "",
        e.message ?? "",
        logTokenText(e.tokens),
      ];
      return fields.join(" ").toLowerCase();
    }
    case "action": {
      const a = target.action;
      const fields = [
        a.id,
        a.name,
        a.description ?? "",
        a.runMode,
        a.enabled ? "enabled" : "disabled",
      ];
      return fields.join(" ").toLowerCase();
    }
    case "runningAction": {
      const r = target.run;
      const fields = [
        r.id,
        r.actionId,
        r.name,
        r.description ?? "",
        r.runMode,
        r.status,
      ];
      return fields.join(" ").toLowerCase();
    }
    default:
      return "";
  }
}

function matchesTerm(term: SearchQueryTerm, target: SearchTarget): boolean {
  if (term.type === "freeText") {
    return includes(defaultTextForTarget(target), term.value);
  }

  if (term.type === "compare") {
    return matchesComparison(term, target);
  }

  if (term.type === "range") {
    return matchesRange(term, target);
  }

  const key = term.key;
  const value = term.value;

  if (key === "text" || key === "message") {
    return includes(defaultTextForTarget(target), value);
  }
  if (key === "id") {
    switch (target.kind) {
      case "player":
        return includes(target.player.id.toLowerCase(), value);
      case "ship":
        return includes(target.ship.id.toLowerCase(), value);
      case "log":
        return includes(target.entry.id.toLowerCase(), value);
      case "action":
        return includes(target.action.id.toLowerCase(), value);
      case "runningAction":
        return includes(
          `${target.run.id} ${target.run.actionId}`.toLowerCase(),
          value,
        );
      default:
        return false;
    }
  }
  if (key === "publicid") {
    switch (target.kind) {
      case "player":
        return includes((target.player.publicId ?? "").toLowerCase(), value);
      case "log":
        return logTokenMatchesFacet(target.entry.tokens, "publicid", value);
      default:
        return false;
    }
  }

  switch (target.kind) {
    case "player": {
      const p = target.player;
      switch (key) {
        case "user":
        case "player":
          return includes(`${p.name} ${p.id}`.toLowerCase(), value);
        case "clan": {
          const derivedClanTag = extractClanTag(p.name);
          const clan = p.clan ?? derivedClanTag ?? "";
          const clanTag = clan ? `[${clan}]` : "";
          return includes(`${clan} ${clanTag}`.toLowerCase(), value);
        }
        case "team":
          return includes((p.team ?? "").toLowerCase(), value);
        default:
          return false;
      }
    }
    case "ship": {
      const s = target.ship;
      switch (key) {
        case "owner":
        case "user":
          return includes(`${s.ownerName} ${s.ownerId}`.toLowerCase(), value);
        case "type":
          return includes(s.type.toLowerCase(), value);
        case "status":
          return includes(deriveShipStatusForSearch(s), value);
        case "origin":
          return includes(formatTileSummaryForSearch(s.origin), value);
        case "current":
          return includes(formatTileSummaryForSearch(s.current), value);
        case "destination":
          return includes(formatTileSummaryForSearch(s.destination), value);
        default:
          return false;
      }
    }
    case "log": {
      const e = target.entry;
      switch (key) {
        case "user":
        case "player":
          return (
            logTokenMatchesType(e.tokens, "player", value) ||
            logTokenMatchesFacet(e.tokens, "user", value) ||
            logTokenMatchesFacet(e.tokens, "player", value)
          );
        case "clan":
          return (
            logTokenMatchesType(e.tokens, "clan", value) ||
            logTokenMatchesFacet(e.tokens, "clan", value)
          );
        case "team":
          return (
            logTokenMatchesType(e.tokens, "team", value) ||
            logTokenMatchesFacet(e.tokens, "team", value)
          );
        case "level":
          return includes((e.level ?? "").toLowerCase(), value);
        case "source":
          return includes((e.source ?? "").toLowerCase(), value);
        default:
          return logTokenMatchesFacet(e.tokens, key, value);
      }
    }
    case "action": {
      const a = target.action;
      switch (key) {
        case "name":
        case "action":
          return includes(a.name.toLowerCase(), value);
        case "desc":
        case "description":
          return includes((a.description ?? "").toLowerCase(), value);
        case "mode":
        case "runmode":
          return includes(a.runMode.toLowerCase(), value);
        case "enabled": {
          const parsed = parseBoolean(value);
          if (parsed === null) {
            return false;
          }
          return a.enabled === parsed;
        }
        default:
          return false;
      }
    }
    case "runningAction": {
      const r = target.run;
      switch (key) {
        case "name":
        case "action":
          return includes(r.name.toLowerCase(), value);
        case "desc":
        case "description":
          return includes((r.description ?? "").toLowerCase(), value);
        case "mode":
        case "runmode":
          return includes(r.runMode.toLowerCase(), value);
        case "status":
          return includes(r.status.toLowerCase(), value);
        default:
          return false;
      }
    }
    default:
      return false;
  }
}

function parseCompareValue(
  value: string,
):
  | { ok: true; op: CompareOp; value: number }
  | { ok: false; isCompareSyntax: boolean; errorMessage: string } {
  const match = /^(>=|<=|!=|=|>|<)\s*(.+)$/.exec(value.trim());
  if (!match) {
    return { ok: false, isCompareSyntax: false, errorMessage: "" };
  }
  const [, opRaw, numberRaw] = match;
  const op = opRaw as CompareOp;
  const num = Number(numberRaw);
  if (!Number.isFinite(num)) {
    return {
      ok: false,
      isCompareSyntax: true,
      errorMessage: `Expected a number after '${op}'`,
    };
  }
  return { ok: true, op, value: num };
}

function parseRangeValue(
  value: string,
):
  | { ok: true; min?: number; max?: number }
  | { ok: false; isRangeSyntax: boolean; errorMessage: string } {
  const trimmed = value.trim();
  const match = /^\s*(-?\d+(?:\.\d+)?)?\s*\.\.\s*(-?\d+(?:\.\d+)?)?\s*$/.exec(
    trimmed,
  );
  if (!match) {
    return { ok: false, isRangeSyntax: false, errorMessage: "" };
  }
  const [, leftTextRaw, rightTextRaw] = match;
  const hasLeft = typeof leftTextRaw === "string" && leftTextRaw.trim() !== "";
  const hasRight =
    typeof rightTextRaw === "string" && rightTextRaw.trim() !== "";
  if (!hasLeft && !hasRight) {
    return {
      ok: false,
      isRangeSyntax: true,
      errorMessage: "Range must specify at least one bound",
    };
  }
  const min = hasLeft ? Number(leftTextRaw) : undefined;
  const max = hasRight ? Number(rightTextRaw) : undefined;
  if (hasLeft && !Number.isFinite(min)) {
    return {
      ok: false,
      isRangeSyntax: true,
      errorMessage: "Range lower bound must be a number",
    };
  }
  if (hasRight && !Number.isFinite(max)) {
    return {
      ok: false,
      isRangeSyntax: true,
      errorMessage: "Range upper bound must be a number",
    };
  }
  return { ok: true, min, max };
}

function compareNumber(op: CompareOp, left: number, right: number): boolean {
  switch (op) {
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    case "=":
      return left === right;
    case "!=":
      return left !== right;
    default:
      return false;
  }
}

function matchesComparison(
  term: Extract<SearchQueryTerm, { type: "compare" }>,
  target: SearchTarget,
): boolean {
  const key = term.key;
  const right = term.value;

  const tryLogFacetNumber = (): boolean => {
    if (target.kind !== "log") {
      return false;
    }
    const tokens = target.entry.tokens;
    if (!tokens) {
      return false;
    }
    for (const token of tokens) {
      if (token.type === "text") {
        continue;
      }
      const values = token.facets?.[key];
      if (!values) {
        continue;
      }
      for (const raw of values) {
        const left =
          typeof raw === "number"
            ? raw
            : typeof raw === "string"
              ? Number(raw)
              : NaN;
        if (!Number.isFinite(left)) {
          continue;
        }
        if (compareNumber(term.op, left, right)) {
          return true;
        }
      }
    }
    return false;
  };

  switch (target.kind) {
    case "player": {
      const p = target.player;
      let left: number | null = null;
      switch (key) {
        case "id": {
          const num = Number(p.id);
          left = Number.isFinite(num) ? num : null;
          break;
        }
        case "tiles":
          left = p.tiles;
          break;
        case "gold":
          left = p.gold;
          break;
        case "troops":
          left = normalizeTroopCountForSearch(p.troops);
          break;
        case "expansions":
          left = p.expansions;
          break;
        case "incoming":
          left = p.incomingAttacks.length;
          break;
        case "outgoing":
          left = p.outgoingAttacks.length;
          break;
        case "supports":
        case "defensive":
          left = p.defensiveSupports.length;
          break;
        case "alliances":
          left = p.alliances.length;
          break;
        case "updated":
        case "lastupdated":
          left = p.lastUpdatedMs;
          break;
        case "lobbypos":
        case "lobbyposition":
          left = typeof p.lobbyPosition === "number" ? p.lobbyPosition : null;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : compareNumber(term.op, left, right);
    }
    case "ship": {
      const s = target.ship;
      let left: number | null = null;
      switch (key) {
        case "troops":
          left = normalizeTroopCountForSearch(s.troops);
          break;
        case "id": {
          const num = Number(s.id);
          left = Number.isFinite(num) ? num : null;
          break;
        }
        default:
          left = null;
          break;
      }
      return left === null ? false : compareNumber(term.op, left, right);
    }
    case "log": {
      const e = target.entry;
      let left: number | null = null;
      switch (key) {
        case "timestamp":
        case "time":
          left = e.timestampMs;
          break;
        default:
          left = null;
          break;
      }
      if (left !== null) {
        return compareNumber(term.op, left, right);
      }
      return tryLogFacetNumber();
    }
    case "action": {
      const a = target.action;
      let left: number | null = null;
      switch (key) {
        case "interval":
        case "runinterval":
        case "runintervalticks":
          left = a.runIntervalTicks;
          break;
        case "created":
        case "createdat":
        case "createdatms":
          left = a.createdAtMs;
          break;
        case "updated":
        case "updatedat":
        case "updatedatms":
          left = a.updatedAtMs;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : compareNumber(term.op, left, right);
    }
    case "runningAction": {
      const r = target.run;
      let left: number | null = null;
      switch (key) {
        case "interval":
        case "runinterval":
        case "runintervalticks":
          left = r.runIntervalTicks;
          break;
        case "started":
        case "startedat":
        case "startedatms":
          left = r.startedAtMs;
          break;
        case "updated":
        case "lastupdated":
        case "lastupdatedms":
          left = r.lastUpdatedMs;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : compareNumber(term.op, left, right);
    }
    default:
      return false;
  }
}

function matchesRange(
  term: Extract<SearchQueryTerm, { type: "range" }>,
  target: SearchTarget,
): boolean {
  const key = term.key;
  const min = term.min;
  const max = term.max;

  const matchesNumber = (left: number): boolean => {
    if (min !== undefined && left < min) {
      return false;
    }
    if (max !== undefined && left > max) {
      return false;
    }
    return true;
  };

  const tryLogFacetNumber = (): boolean => {
    if (target.kind !== "log") {
      return false;
    }
    const tokens = target.entry.tokens;
    if (!tokens) {
      return false;
    }
    for (const token of tokens) {
      if (token.type === "text") {
        continue;
      }
      const values = token.facets?.[key];
      if (!values) {
        continue;
      }
      for (const raw of values) {
        const left =
          typeof raw === "number"
            ? raw
            : typeof raw === "string"
              ? Number(raw)
              : NaN;
        if (!Number.isFinite(left)) {
          continue;
        }
        if (matchesNumber(left)) {
          return true;
        }
      }
    }
    return false;
  };

  switch (target.kind) {
    case "player": {
      const p = target.player;
      let left: number | null = null;
      switch (key) {
        case "id": {
          const num = Number(p.id);
          left = Number.isFinite(num) ? num : null;
          break;
        }
        case "tiles":
          left = p.tiles;
          break;
        case "gold":
          left = p.gold;
          break;
        case "troops":
          left = normalizeTroopCountForSearch(p.troops);
          break;
        case "expansions":
          left = p.expansions;
          break;
        case "incoming":
          left = p.incomingAttacks.length;
          break;
        case "outgoing":
          left = p.outgoingAttacks.length;
          break;
        case "supports":
        case "defensive":
          left = p.defensiveSupports.length;
          break;
        case "alliances":
          left = p.alliances.length;
          break;
        case "updated":
        case "lastupdated":
          left = p.lastUpdatedMs;
          break;
        case "lobbypos":
        case "lobbyposition":
          left = typeof p.lobbyPosition === "number" ? p.lobbyPosition : null;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : matchesNumber(left);
    }
    case "ship": {
      const s = target.ship;
      let left: number | null = null;
      switch (key) {
        case "troops":
          left = normalizeTroopCountForSearch(s.troops);
          break;
        case "id": {
          const num = Number(s.id);
          left = Number.isFinite(num) ? num : null;
          break;
        }
        default:
          left = null;
          break;
      }
      return left === null ? false : matchesNumber(left);
    }
    case "log": {
      const e = target.entry;
      let left: number | null = null;
      switch (key) {
        case "timestamp":
        case "time":
          left = e.timestampMs;
          break;
        default:
          left = null;
          break;
      }
      if (left !== null) {
        return matchesNumber(left);
      }
      return tryLogFacetNumber();
    }
    case "action": {
      const a = target.action;
      let left: number | null = null;
      switch (key) {
        case "interval":
        case "runinterval":
        case "runintervalticks":
          left = a.runIntervalTicks;
          break;
        case "created":
        case "createdat":
        case "createdatms":
          left = a.createdAtMs;
          break;
        case "updated":
        case "updatedat":
        case "updatedatms":
          left = a.updatedAtMs;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : matchesNumber(left);
    }
    case "runningAction": {
      const r = target.run;
      let left: number | null = null;
      switch (key) {
        case "interval":
        case "runinterval":
        case "runintervalticks":
          left = r.runIntervalTicks;
          break;
        case "started":
        case "startedat":
        case "startedatms":
          left = r.startedAtMs;
          break;
        case "updated":
        case "lastupdated":
        case "lastupdatedms":
          left = r.lastUpdatedMs;
          break;
        default:
          left = null;
          break;
      }
      return left === null ? false : matchesNumber(left);
    }
    default:
      return false;
  }
}
