/** Payme JSON-RPC amounts are in tiyin (1/100 UZS). Single conversion boundary. */

export function somToTiyin(som: number): number {
  return Math.round(som * 100);
}

export function tiyinToSom(tiyin: number): number {
  return Math.round(tiyin / 100);
}
