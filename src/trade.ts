export interface TradeStatusCarrier {
  tradeStopped?: boolean;
  tradeStoppedBySelf?: boolean;
  tradeStoppedByOther?: boolean;
}

export function isTradeStoppedBySelf(carrier: TradeStatusCarrier): boolean {
  if (typeof carrier.tradeStoppedBySelf === "boolean") {
    return carrier.tradeStoppedBySelf;
  }
  if (carrier.tradeStopped !== true) {
    return false;
  }
  if (carrier.tradeStoppedByOther === true) {
    return false;
  }
  return true;
}

export function isTradeStoppedByOther(carrier: TradeStatusCarrier): boolean {
  if (typeof carrier.tradeStoppedByOther === "boolean") {
    return carrier.tradeStoppedByOther;
  }
  if (carrier.tradeStopped !== true) {
    return false;
  }
  if (carrier.tradeStoppedBySelf === true) {
    return false;
  }
  return true;
}
