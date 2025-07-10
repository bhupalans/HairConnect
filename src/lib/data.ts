import type { Product, Seller, Buyer, QuoteRequest } from './types';

export const sellers: Seller[] = [
  {
    id: 'seller-1',
    name: 'Aisha Bella',
    companyName: 'Bella Hair Imports',
    location: 'Lagos, Nigeria',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Specializing in premium, ethically sourced raw Nigerian hair. With over 10 years of experience, we provide the highest quality bundles for wigs and extensions.',
    memberSince: '2018-05-15',
    productIds: ['prod-1', 'prod-2'],
    contact: { email: 'aisha@bellahair.ng', website: 'bellahair.ng' },
  },
  {
    id: 'seller-2',
    name: 'Lien Nguyen',
    companyName: 'Vietnamese Silk Hair',
    location: 'Hanoi, Vietnam',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Authentic Vietnamese hair, known for its silky texture and durability. We offer a wide range of lengths and natural colors, direct from local collectors.',
    memberSince: '2020-01-20',
    productIds: ['prod-3'],
    contact: { email: 'lien@vnsilkhair.com' },
  },
  {
    id: 'seller-3',
    name: 'Isabella Rossi',
    companyName: 'Euro Weaves Co.',
    location: 'Milan, Italy',
    avatarUrl: 'https://placehold.co/100x100',
    bio: 'Luxury European hair extensions and custom wigs. Our hair is sourced from Eastern Europe and is perfect for high-end styling and coloring.',
    memberSince: '2019-11-02',
    productIds: ['prod-4'],
    contact: { email: 'isabella@euroweaves.it', phone: '+39 123 456 7890' },
  },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Premium Nigerian Raw Wavy Bundles',
    description: '100% unprocessed raw hair from Nigeria. Natural wave pattern with a medium luster. Can be bleached to 613 and styled as desired. Each bundle is 100g.',
    price: 85.00,
    sellerId: 'seller-1',
    category: 'Raw Hair',
    images: ['https://placehold.co/600x600', 'https://placehold.co/600x600', 'https://placehold.co/600x600'],
    specs: {
      type: 'Bundle',
      length: '18 inches',
      color: 'Natural Black (1B)',
      texture: 'Natural Wavy',
      origin: 'Nigeria',
    },
  },
  {
    id: 'prod-2',
    name: 'Luxury Deep Wave HD Lace Wig',
    description: 'A full lace wig made with our finest deep wave bundles. Transparent HD lace for a seamless melt. Pre-plucked hairline and bleached knots.',
    price: 320.00,
    sellerId: 'seller-1',
    category: 'Wigs',
    images: ['https://placehold.co/600x600', 'https://placehold.co/600x600'],
    specs: {
      type: 'Full Lace Wig',
      length: '22 inches',
      color: 'Natural Black (1B)',
      texture: 'Deep Wave',
      origin: 'Nigeria',
    },
  },
  {
    id: 'prod-3',
    name: 'Silky Straight Vietnamese Virgin Hair',
    description: 'Double drawn virgin hair from Vietnam. Incredibly silky, smooth, and tangle-free. This hair has a natural sheen and can last for years with proper care.',
    price: 95.00,
    sellerId: 'seller-2',
    category: 'Virgin Hair',
    images: ['https://placehold.co/600x600'],
    specs: {
      type: 'Bundle',
      length: '24 inches',
      color: 'Natural Brown',
      texture: 'Silky Straight',
      origin: 'Vietnam',
    },
  },
  {
    id: 'prod-4',
    name: 'Platinum Blonde European Tape-In Extensions',
    description: 'High-quality tape-in extensions made from sourced Eastern European hair. Thick from root to tip. Pre-taped with strong, yet gentle adhesive.',
    price: 150.00,
    sellerId: 'seller-3',
    category: 'Extensions',
    images: ['https://placehold.co/600x600', 'https://placehold.co/600x600'],
    specs: {
      type: 'Tape-In Extensions (40 pcs)',
      length: '20 inches',
      color: 'Platinum Blonde (#60)',
      texture: 'Straight',
      origin: 'Eastern Europe',
    },
  },
];

export const buyers: Buyer[] = [
    {
        id: 'buyer-1',
        name: 'Chloe Kim',
        companyName: 'Glamour Locks Salon',
        location: 'Los Angeles, USA',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'High-end salon in Beverly Hills looking for top-tier virgin and raw hair for our exclusive clientele. We prioritize quality and ethical sourcing.',
        memberSince: '2021-02-10',
        contact: { email: 'chloe@glamourlocks.com' },
    },
    {
        id: 'buyer-2',
        name: 'Fatou Diallo',
        companyName: 'Parisian Wigs Boutique',
        location: 'Paris, France',
        avatarUrl: 'https://placehold.co/100x100',
        bio: 'We create custom medical and fashion wigs. Seeking durable, high-density hair that can withstand extensive coloring and styling.',
        memberSince: '2022-07-01',
        contact: { email: 'fatou.d@pariswigs.fr' },
    },
];

export const quoteRequests: QuoteRequest[] = [];

export const featuredProducts = products.slice(0, 4);

export const categories = [
    { name: 'Raw Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Virgin Hair', icon: 'https://placehold.co/40x40' },
    { name: 'Wigs', icon: 'https://placehold.co/40x40' },
    { name: 'Extensions', icon: 'https://placehold.co/40x40' },
    { name: 'Tools', icon: 'https://placehold.co/40x40' },
];

export function getProductById(id: string) {
  return products.find(p => p.id === id);
}

export function getSellerById(id: string) {
  return sellers.find(s => s.id === id);
}

export function getProductsBySeller(sellerId: string) {
  return products.filter(p => p.sellerId === sellerId);
}

export function getBuyerById(id:string) {
    return buyers.find(b => b.id === id);
}

export function addQuoteRequest(data: Omit<QuoteRequest, 'id' | 'date'>) {
    const newRequest: QuoteRequest = {
        id: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        date: new Date().toISOString(),
        ...data
    };
    quoteRequests.push(newRequest);
}

export function getQuoteRequests() {
    return quoteRequests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
