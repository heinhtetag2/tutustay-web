/**
 * Demo photos, matched to each mock stay (free-licence Unsplash images in public/demo, see CREDITS.md).
 * A tour is a list of named groups: the property's areas first, then each room type. Stays without an entry fall back to tinted tiles.
 */
export interface Photo { id: string; group: string; groupId: string; tone: number; src?: string; alt: string }
export interface PhotoGroup { id: string; title: string; photos: Photo[] }

interface StayMedia { areas: { id: string; title: string; images: string[] }[]; rooms: Record<string, string[]> }

const MEDIA: Record<string, StayMedia> = {
  "st-01": {
    areas: [
      { id: "exterior", title: "Exterior", images: ["1689877549814", "1657639754447"] },
      { id: "lobby", title: "Lobby", images: ["1660557989695"] },
      { id: "rooftop", title: "Rooftop", images: ["1746475611952", "1657639753220"] },
    ],
    rooms: { "st-01-a": ["1611892440504", "1631049307264"], "st-01-b": ["1631049552057", "1568495248636"], "st-01-c": ["1576354302919", "1611892440504"] },
  },
  "st-02": {
    areas: [
      { id: "exterior", title: "Exterior", images: ["1558690256", "1593672603619", "1637946094815"] },
      { id: "lake", title: "Lake and dock", images: ["1621571113981", "1586355216449"] },
    ],
    rooms: { "st-02-a": ["1659428678652", "1730751686920"], "st-02-b": ["1761470371217", "1659428678652"] },
  },
  "st-03": {
    areas: [
      { id: "beach", title: "Beach", images: ["1602002418816", "1617859047452"] },
      { id: "pool", title: "Pool", images: ["1610641818989", "1623718649591"] },
      { id: "restaurant", title: "Restaurant", images: ["1729615385114", "1743413515530"] },
    ],
    rooms: { "st-03-a": ["1770414173168", "1631049552057"], "st-03-b": ["1576354302919", "1770414173168"] },
  },
  "st-04": {
    areas: [
      { id: "campsite", title: "Campsite", images: ["1524800866064", "1504280390367"] },
      { id: "campfire", title: "Campfire area", images: ["1533414417583", "1486679679458"] },
      { id: "cabins", title: "Cabins", images: ["1570793005386", "1703346387512"] },
    ],
    rooms: { "st-04-a": ["1624923686627", "1473787700681"], "st-04-b": ["1621771674545", "1703346387512"] },
  },
  "st-05": {
    areas: [
      { id: "temples", title: "The temples", images: ["1702226580087", "1599403275295"] },
      { id: "sunrise", title: "Sunrise", images: ["1662657080109", "1584897356466"] },
      { id: "terrace", title: "Terrace", images: ["1759751104723"] },
    ],
    rooms: { "st-05-a": ["1662841540530", "1559841644"], "st-05-b": ["1568495248636", "1631049307264"] },
  },
  "st-06": {
    areas: [
      { id: "beach", title: "Beachfront", images: ["1674216644907", "1594433575301"] },
      { id: "pool", title: "Pool", images: ["1674216644904", "1709140624408"] },
      { id: "dining", title: "Dining", images: ["1674216645383"] },
    ],
    rooms: { "st-06-a": ["1770414173168", "1611892440504"] },
  },
  "st-07": {
    areas: [
      { id: "entrance", title: "Entrance", images: ["1761061079411", "1700061036086"] },
      { id: "lanterns", title: "Lanterns", images: ["1786561210054"] },
    ],
    rooms: { "st-07-a": ["1664227430717", "1662411394768"] },
  },
  "st-08": {
    areas: [
      { id: "river", title: "Riverside", images: ["1691149136454", "1660479082506", "1776174550936"] },
      { id: "lobby", title: "Lobby", images: ["1660557989725"] },
      { id: "breakfast", title: "Breakfast", images: ["1596701062351"] },
    ],
    rooms: { "st-08-a": ["1790774877819", "1662411394768"], "st-08-b": ["1779447425044", "1790774885419"] },
  },
};

const src = (id: string) => `/demo/${id}.jpg`;
let tones = 0;
const nextTone = () => (tones++ * 47) % 360;

function toPhotos(stayName: string, groupId: string, group: string, images: string[] | undefined, count: number): Photo[] {
  return Array.from({ length: images?.length ?? count }, (_, i) => ({
    id: `${groupId}-${i}`, groupId, group, tone: nextTone(), src: images?.[i] !== undefined ? src(images[i]!) : undefined, alt: `${stayName}: ${group}`,
  }));
}

export function buildPhotoGroups(stayId: string, stayName: string, rooms: { id: string; name: string }[]): PhotoGroup[] {
  tones = 0;
  const media = MEDIA[stayId];
  const areas = media?.areas ?? [{ id: "exterior", title: "Exterior", images: undefined }, { id: "lobby", title: "Lobby", images: undefined }];
  return [
    ...areas.map((a) => ({ id: a.id, title: a.title, photos: toPhotos(stayName, a.id, a.title, a.images, 2) })),
    ...rooms.map((r) => ({ id: r.id, title: r.name, photos: toPhotos(stayName, r.id, r.name, media?.rooms[r.id], 2) })),
  ];
}

/** First photo of a stay, for result cards. */
export function stayCover(stayId: string): string | undefined {
  const first = MEDIA[stayId]?.areas[0]?.images[0];
  return first ? src(first) : undefined;
}

/** First photo of a room type, for room cards. */
export function roomCover(stayId: string, roomId: string): string | undefined {
  const first = MEDIA[stayId]?.rooms[roomId]?.[0];
  return first ? src(first) : undefined;
}
