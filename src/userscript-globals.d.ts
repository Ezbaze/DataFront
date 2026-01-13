declare const unsafeWindow: Window | undefined;

declare const GM_getValue:
  | undefined
  | (<TValue = unknown>(key: string, defaultValue?: TValue) => TValue);

declare const GM_setValue: undefined | ((key: string, value: unknown) => void);
