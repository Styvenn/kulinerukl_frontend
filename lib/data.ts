// ─── Types ────────────────────────────────────────────────────────────────────
export type PriceRange = 'budget' | 'mid' | 'premium';
export type Ambiance = 'indoor' | 'outdoor' | 'rooftop' | 'cozy' | 'lively';
export type Category =
  | 'street-food'
  | 'cafe'
  | 'noodle'
  | 'dessert'
  | 'night-hangout'
  | 'indonesian'
  | 'western';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
  photo?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: Category;
  categories?: Category[];
  description: string;
  address: string;
  district: string;   // kecamatan
  city: string;
  phone: string;
  openHours: string;
  priceRange: PriceRange;
  priceMin: number;
  priceMax: number;
  rating: number;
  reviewCount: number;
  ambiance: Ambiance[];
  coverImage: string;
  thumbnailImage: string;
  mapUrl: string;
  menu: MenuItem[];
  reviews: Review[];
  isActive: boolean;
}

// ─── Helper ────────────────────────────────────────────────────────────────────
export const PRICE_LABEL: Record<PriceRange, string> = {
  budget:  'Rp 10k – 30k',
  mid:     'Rp 30k – 75k',
  premium: 'Rp 75k+',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  'street-food':   'Street Food',
  cafe:            'Cozy Cafe',
  noodle:          'Noodle Spots',
  dessert:         'Dessert',
  'night-hangout': 'Night Hangout',
  indonesian:      'Indonesian',
  western:         'Western',
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Warung Makan Bu Tini',
    slug: 'warung-makan-bu-tini',
    category: 'street-food',
    categories: ['street-food', 'indonesian'],
    description:
      'Warung legendaris sejak 1985 yang menyajikan masakan rumahan autentik dengan cita rasa Jawa yang khas. Tempat makan favorit warga lokal.',
    address: 'Jl. Pahlawan No. 12, Blimbing',
    district: 'Blimbing',
    city: 'Malang',
    phone: '0341-123456',
    openHours: 'Senin–Sabtu: 07.00–21.00',
    priceRange: 'budget',
    priceMin: 10000,
    priceMax: 25000,
    rating: 4.8,
    reviewCount: 234,
    ambiance: ['indoor', 'lively'],
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=Warung+Bu+Tini+Malang',
    menu: [
      { id: 'm1', name: 'Nasi Rawon', price: 18000, description: 'Sup daging sapi hitam khas Jawa Timur' },
      { id: 'm2', name: 'Soto Ayam', price: 15000, description: 'Soto bening dengan ayam kampung pilihan' },
      { id: 'm3', name: 'Nasi Pecel', price: 12000, description: 'Sayuran segar dengan sambal kacang spesial' },
      { id: 'm4', name: 'Tempe Penyet', price: 10000, description: 'Tempe goreng dengan sambal terasi' },
    ],
    reviews: [
      {
        id: 'rv1',
        userId: 'u2',
        userName: 'Rina Dewi',
        userAvatar: '',
        rating: 5,
        comment: 'Rawon-nya juara banget! Sudah langganan dari kecil, rasanya konsisten dan harga tetap terjangkau.',
        date: '2025-05-10',
      },
      {
        id: 'rv2',
        userId: 'u3',
        userName: 'Agus Pratama',
        userAvatar: '',
        rating: 4,
        comment: 'Enak, porsinya besar. Tempatnya sederhana tapi bersih. Recommended!',
        date: '2025-04-28',
      },
    ],
    isActive: true,
  },
  {
    id: 'r2',
    name: 'Kopi Nusantara Café',
    slug: 'kopi-nusantara-cafe',
    category: 'cafe',
    categories: ['cafe', 'dessert'],
    description:
      'Kafe modern dengan konsep "farm to cup" yang menyajikan kopi single-origin dari berbagai daerah Indonesia. Suasana cozy dan instagramable.',
    address: 'Jl. Ijen Boulevard No. 45',
    district: 'Klojen',
    city: 'Malang',
    phone: '0341-654321',
    openHours: 'Setiap Hari: 08.00–23.00',
    priceRange: 'mid',
    priceMin: 25000,
    priceMax: 65000,
    rating: 4.6,
    reviewCount: 412,
    ambiance: ['indoor', 'cozy'],
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=Kopi+Nusantara+Malang',
    menu: [
      { id: 'm5', name: 'Single Origin Flores', price: 35000, description: 'Pour over kopi arabika flores dengan nuansa fruity' },
      { id: 'm6', name: 'Es Kopi Susu Gula Aren', price: 28000, description: 'Kopi susu segar dengan gula aren asli' },
      { id: 'm7', name: 'Croissant Butter', price: 32000, description: 'Croissant lapis buatan sendiri, crispy di luar lembut di dalam' },
      { id: 'm8', name: 'Avocado Toast', price: 45000, description: 'Toast dengan topping alpukat segar dan telur poach' },
    ],
    reviews: [
      {
        id: 'rv3',
        userId: 'u1',
        userName: 'Budi Santoso',
        userAvatar: '',
        rating: 5,
        comment: 'Kopi Flores-nya beneran bagus, bisa ngerasain floral notes-nya. WiFi kenceng, cocok buat WFH.',
        date: '2025-05-15',
      },
    ],
    isActive: true,
  },
  {
    id: 'r3',
    name: 'Mie Aceh Pak Slamet',
    slug: 'mie-aceh-pak-slamet',
    category: 'noodle',
    categories: ['noodle', 'street-food'],
    description:
      'Otentik Mie Aceh dengan bumbu rempah lengkap. Pilihan kuah gurih atau goreng kering yang sama-sama memanjakan lidah.',
    address: 'Jl. Gatot Subroto No. 88, Lowokwaru',
    district: 'Lowokwaru',
    city: 'Malang',
    phone: '0341-789012',
    openHours: 'Senin–Minggu: 10.00–22.00',
    priceRange: 'budget',
    priceMin: 18000,
    priceMax: 35000,
    rating: 4.7,
    reviewCount: 189,
    ambiance: ['indoor', 'lively'],
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=Mie+Aceh+Pak+Slamet+Malang',
    menu: [
      { id: 'm9', name: 'Mie Aceh Kuah', price: 25000, description: 'Mie tebal dengan kuah rempah kaya bumbu' },
      { id: 'm10', name: 'Mie Aceh Goreng', price: 25000, description: 'Mie aceh goreng kering pedas gurih' },
      { id: 'm11', name: 'Mie Aceh Seafood', price: 35000, description: 'Tambahan udang dan cumi segar' },
      { id: 'm12', name: 'Es Teh Tarik', price: 8000, description: 'Teh manis creamy khas ala kedai Melayu' },
    ],
    reviews: [],
    isActive: true,
  },
  {
    id: 'r4',
    name: 'Dapur Dessert & Co',
    slug: 'dapur-dessert-co',
    category: 'dessert',
    categories: ['dessert', 'cafe'],
    description:
      'Surga pecinta manis! Dari Japanese cheesecake, es krim artisan, hingga boba premium. Perfect spot untuk nongkrong sore hari.',
    address: 'Jl. Sunandar Priyo Sudarmo No. 3',
    district: 'Sukun',
    city: 'Malang',
    phone: '0341-345678',
    openHours: 'Setiap Hari: 12.00–22.00',
    priceRange: 'mid',
    priceMin: 20000,
    priceMax: 55000,
    rating: 4.5,
    reviewCount: 301,
    ambiance: ['indoor', 'cozy'],
    coverImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=Dapur+Dessert+Malang',
    menu: [
      { id: 'm13', name: 'Japanese Cheesecake', price: 35000, description: 'Cheesecake fluffy ala Jepang, melt in your mouth' },
      { id: 'm14', name: 'Boba Taro Latte', price: 28000, description: 'Minuman taro creamy dengan boba kenyal' },
      { id: 'm15', name: 'Artisan Ice Cream', price: 32000, description: '2 scoop es krim dengan topping bebas' },
      { id: 'm16', name: 'Mochi Ice Cream', price: 25000, description: 'Mochi isi es krim aneka rasa' },
    ],
    reviews: [],
    isActive: true,
  },
  {
    id: 'r5',
    name: 'Angkringan Mas Joko',
    slug: 'angkringan-mas-joko',
    category: 'night-hangout',
    categories: ['night-hangout', 'street-food'],
    description:
      'Spot nongkrong malam paling hits di Malang! Angkringan dengan suasana lampu temaram, live acoustic, dan aneka jajan pasar lokal.',
    address: 'Jl. Veteran No. 7, depan Alun-alun',
    district: 'Klojen',
    city: 'Malang',
    phone: '0812-3456789',
    openHours: 'Setiap Hari: 17.00–02.00',
    priceRange: 'budget',
    priceMin: 5000,
    priceMax: 20000,
    rating: 4.9,
    reviewCount: 567,
    ambiance: ['outdoor', 'lively'],
    coverImage: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=Angkringan+Mas+Joko+Malang',
    menu: [
      { id: 'm17', name: 'Nasi Kucing', price: 5000, description: 'Nasi putih porsi kecil dengan lauk sambal' },
      { id: 'm18', name: 'Sate Usus', price: 3000, description: 'Sate usus ayam bumbu kacang, per tusuk' },
      { id: 'm19', name: 'Wedang Jahe', price: 8000, description: 'Minuman jahe hangat dengan gula batu' },
      { id: 'm20', name: 'Es Campur', price: 12000, description: 'Es campur segar dengan berbagai isian' },
    ],
    reviews: [
      {
        id: 'rv4',
        userId: 'u4',
        userName: 'Siti Rahayu',
        userAvatar: '',
        rating: 5,
        comment: 'Suasana malamnya mantep banget! Live musiknya bikin betah. Harga murah banget.',
        date: '2025-05-20',
      },
    ],
    isActive: true,
  },
  {
    id: 'r6',
    name: 'The Rooftop Kitchen',
    slug: 'the-rooftop-kitchen',
    category: 'night-hangout',
    categories: ['night-hangout', 'western'],
    description:
      'Restoran rooftop dengan pemandangan kota Malang yang spektakuler. Menu western fusion dengan sentuhan lokal, perfect untuk dinner romantis.',
    address: 'Jl. Semeru No. 23, Lt. 5',
    district: 'Klojen',
    city: 'Malang',
    phone: '0341-901234',
    openHours: 'Senin–Minggu: 16.00–23.30',
    priceRange: 'premium',
    priceMin: 75000,
    priceMax: 200000,
    rating: 4.4,
    reviewCount: 98,
    ambiance: ['rooftop', 'indoor'],
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    thumbnailImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    mapUrl: 'https://maps.google.com/?q=The+Rooftop+Kitchen+Malang',
    menu: [
      { id: 'm21', name: 'Wagyu Burger', price: 145000, description: 'Wagyu beef patty dengan brioche bun dan saus truffle' },
      { id: 'm22', name: 'Pasta Aglio Olio', price: 85000, description: 'Pasta homemade dengan bawang putih, chili, dan olive oil' },
      { id: 'm23', name: 'Grilled Salmon', price: 175000, description: 'Fillet salmon dengan lemon butter dan sayuran panggang' },
      { id: 'm24', name: 'Mocktail Signature', price: 45000, description: 'Mocktail buatan bartender spesial setiap malam' },
    ],
    reviews: [],
    isActive: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getRestaurantById(id: string): Restaurant | undefined {
  return MOCK_RESTAURANTS.find((r) => r.id === id);
}

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return MOCK_RESTAURANTS.find((r) => r.slug === slug);
}

export const DISTRICTS = [...new Set(MOCK_RESTAURANTS.map((r) => r.district))];
