import type { Listing } from "@/lib/types";
import { firstNumber, firstString, safeNumber } from "@/lib/utils/stats";

type RawRecord = Record<string, unknown>;

function firstListingUrl(raw: RawRecord): string | undefined {
  const direct = firstString(raw.listingUrl, raw.url);
  if (direct) return direct;
  const urls = raw.listingUrls;
  if (urls && typeof urls === "object") {
    return Object.values(urls as Record<string, unknown>).find((value): value is string => typeof value === "string");
  }
  return undefined;
}

function firstSource(raw: RawRecord): string | undefined {
  const source = firstString(raw.source);
  if (source) return source;
  const found = raw.foundOnSources;
  if (Array.isArray(found)) return firstString(found[0]);
  return undefined;
}

export function parseListings(records: unknown[]): Listing[] {
  return records.filter((record): record is RawRecord => !!record && typeof record === "object").map((raw) => {
    const agent = raw.agent && typeof raw.agent === "object" ? (raw.agent as RawRecord) : {};
    const broker = raw.broker && typeof raw.broker === "object" ? (raw.broker as RawRecord) : {};
    return {
      id: firstString(raw.id, raw.listingId),
      address: firstString(raw.address, raw.fullAddress, raw.streetAddress),
      city: firstString(raw.city),
      state: firstString(raw.state),
      zip: firstString(raw.zip, raw.zipcode, raw.postalCode),
      price: firstNumber(raw.price, raw.listPrice),
      beds: firstNumber(raw.beds, raw.bedrooms),
      baths: firstNumber(raw.baths, raw.bathrooms),
      sqft: firstNumber(raw.sqft, raw.livingArea),
      pricePerSqft: firstNumber(raw.pricePerSqft, raw.price_per_sqft),
      daysOnMarket: firstNumber(raw.daysOnMarket, raw.dom),
      propertyType: firstString(raw.propertyType, raw.homeType),
      status: firstString(raw.status, raw.listingStatus),
      listingUrl: firstListingUrl(raw),
      source: firstSource(raw),
      agentName: firstString(agent.name, raw.agentName),
      brokerName: firstString(broker.name, raw.brokerName),
      latitude: safeNumber(raw.latitude),
      longitude: safeNumber(raw.longitude)
    };
  });
}
