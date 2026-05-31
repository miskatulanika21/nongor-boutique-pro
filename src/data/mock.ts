export type Product = {
  id: string;
  slug: string;
  name: string;
  bnName?: string;
  price: number;
  discountPrice?: number;
  category: string;
  collection: string[];
  fabric: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  stock: number;
  stockByVariant?: Record<string, number>;
  rating: number;
  reviewCount: number;
  description: string;
  occasion?: string;
  createdAt?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  featured?: boolean;
  status: "Published" | "Draft" | "Archived";
  sku?: string | null;
};

const img = (seed: string, w = 800, h = 1000) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// Curated Unsplash IDs that show women's fashion / fabric textures
const photos = [
  "1583391733956-3750e0ff4e8b",
  "1610030469983-98e550d6193c",
  "1612722432474-b971cdcea546",
  "1583394293214-28a4b0025e74",
  "1606902965551-dce093cda6e7",
  "1591047139829-d91aecb6caea",
  "1594633312681-425c7b97ccd1",
  "1602810318383-e386cc2a3ccf",
  "1614251056216-f748f76cd228",
  "1583394838336-acd977736f90",
];

const pick = (i: number) => photos[i % photos.length];

export const products: Product[] = [
  {
    id: "p1",
    slug: "maroon-nakshi-handmade-kurti",
    name: "Maroon Nakshi Handmade Kurti",
    bnName: "মেরুন নকশী হাতে তৈরি কুর্তি",
    price: 3200,
    discountPrice: 2690,
    category: "Kurti",
    collection: ["New Arrival", "Best Seller", "Handmade Kurti"],
    fabric: "Pure Cotton",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Maroon", hex: "#6b1f2a" },
      { name: "Ivory", hex: "#f3ead8" },
    ],
    images: [img(pick(0)), img(pick(1)), img(pick(2))],
    stock: 8,
    rating: 4.8,
    reviewCount: 124,
    description:
      "Hand-stitched Nakshi kantha motifs flow across deep maroon cotton — every kurti is sewn one at a time by women artisans in rural Bangladesh.",
    isNew: true,
    isBestSeller: true,
    featured: true,
    status: "Published",
  },
  {
    id: "p2",
    slug: "ivory-floral-cotton-kurti",
    name: "Ivory Floral Cotton Kurti",
    price: 2490,
    category: "Kurti",
    collection: ["New Arrival", "Handmade Kurti"],
    fabric: "Soft Cotton",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ name: "Ivory", hex: "#f3ead8" }],
    images: [img(pick(3)), img(pick(4))],
    stock: 14,
    rating: 4.7,
    reviewCount: 56,
    description: "Soft ivory cotton with delicate hand-embroidered florals.",
    isNew: true,
    featured: true,
    status: "Published",
  },
  {
    id: "p3",
    slug: "golden-thread-festive-kurti",
    name: "Golden Thread Festive Kurti",
    price: 3890,
    discountPrice: 3290,
    category: "Kurti",
    collection: ["Festive Collection", "Best Seller"],
    fabric: "Silk Blend",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Maroon", hex: "#6b1f2a" },
      { name: "Gold", hex: "#c79a45" },
    ],
    images: [img(pick(5)), img(pick(6))],
    stock: 3,
    rating: 4.9,
    reviewCount: 88,
    description: "Festive silk blend kurti with golden thread embroidery.",
    isBestSeller: true,
    featured: true,
    status: "Published",
  },
  {
    id: "p4",
    slug: "deep-maroon-artisan-kurti",
    name: "Deep Maroon Artisan Kurti",
    price: 2890,
    category: "Kurti",
    collection: ["Handmade Kurti"],
    fabric: "Khadi Cotton",
    sizes: ["S", "M", "L"],
    colors: [{ name: "Maroon", hex: "#5a1a25" }],
    images: [img(pick(7)), img(pick(8))],
    stock: 11,
    rating: 4.6,
    reviewCount: 42,
    description: "Khadi cotton with traditional artisan stitching.",
    status: "Published",
  },
  {
    id: "p5",
    slug: "soft-beige-everyday-kurti",
    name: "Soft Beige Everyday Kurti",
    price: 1990,
    discountPrice: 1690,
    category: "Kurti",
    collection: ["New Arrival"],
    fabric: "Cotton Voile",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Beige", hex: "#d4c4a8" },
      { name: "Ivory", hex: "#f3ead8" },
    ],
    images: [img(pick(9)), img(pick(0))],
    stock: 22,
    rating: 4.5,
    reviewCount: 31,
    description: "Lightweight everyday kurti in soft beige.",
    isNew: true,
    status: "Published",
  },
  {
    id: "p6",
    slug: "wine-red-handloom-kurti",
    name: "Wine Red Handloom Kurti",
    price: 3490,
    category: "Kurti",
    collection: ["Best Seller", "Handmade Kurti"],
    fabric: "Handloom Cotton",
    sizes: ["M", "L", "XL"],
    colors: [{ name: "Wine", hex: "#722f37" }],
    images: [img(pick(1)), img(pick(3))],
    stock: 6,
    rating: 4.8,
    reviewCount: 67,
    description: "Handloom cotton woven by Tangail weavers.",
    isBestSeller: true,
    status: "Published",
  },
  {
    id: "p7",
    slug: "antique-rose-embroidered-kurti",
    name: "Antique Rose Embroidered Kurti",
    price: 2790,
    category: "Kurti",
    collection: ["New Arrival"],
    fabric: "Cotton",
    sizes: ["S", "M", "L"],
    colors: [{ name: "Rose", hex: "#9c5566" }],
    images: [img(pick(2)), img(pick(4))],
    stock: 9,
    rating: 4.7,
    reviewCount: 28,
    description: "Vintage rose tones with delicate embroidery.",
    isNew: true,
    status: "Published",
  },
  {
    id: "p8",
    slug: "festive-maroon-gold-kurti",
    name: "Festive Maroon Gold Kurti",
    price: 4290,
    discountPrice: 3690,
    category: "Kurti",
    collection: ["Festive Collection"],
    fabric: "Silk Cotton",
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Maroon", hex: "#6b1f2a" }],
    images: [img(pick(6)), img(pick(8))],
    stock: 4,
    rating: 5.0,
    reviewCount: 19,
    description: "Statement festive piece with antique gold detailing.",
    featured: true,
    status: "Published",
  },
];

export const categories = [
  { id: "c1", name: "Handmade Kurti", image: img(pick(0), 600, 600), count: 24, status: "Active" },
  { id: "c2", name: "New Arrivals", image: img(pick(3), 600, 600), count: 12, status: "Active" },
  { id: "c3", name: "Best Sellers", image: img(pick(5), 600, 600), count: 8, status: "Active" },
  {
    id: "c4",
    name: "Festive Collection",
    image: img(pick(6), 600, 600),
    count: 6,
    status: "Active",
  },
  {
    id: "c5",
    name: "Coming Soon — Saree",
    image: img(pick(8), 600, 600),
    count: 0,
    status: "Coming Soon",
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "Tasnim Rahman",
    location: "Dhanmondi, Dhaka",
    rating: 5,
    text: "The handwork is unbelievable. I've never owned a kurti this beautifully stitched. Nongor is now my favourite brand.",
  },
  {
    id: "t2",
    name: "Nusrat Jahan",
    location: "Chattogram",
    rating: 5,
    text: "Premium fabric, premium feel. Delivery was quick and the packaging felt like a gift.",
  },
  {
    id: "t3",
    name: "Mehnaz Karim",
    location: "Sylhet",
    rating: 5,
    text: "Finally a Bangladeshi brand that respects our culture while feeling modern. Will order again.",
  },
];

export const districts = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Cox's Bazar",
  "Jashore",
  "Bogura",
  "Dinajpur",
];

export const upazilas: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Gulshan", "Mirpur", "Uttara", "Mohammadpur", "Banani"],
  Chattogram: ["Pahartali", "Halishahar", "Agrabad", "Nasirabad"],
  Sylhet: ["Zindabazar", "Ambarkhana", "Subidbazar"],
};

export type Order = {
  id: string;
  customer: string;
  phone: string;
  district: string;
  date: string;
  items: number;
  total: number;
  payment: "bKash" | "Nagad" | "Rocket" | "COD" | "Card" | "ShurjoPay";
  paymentStatus: "Pending" | "Paid" | "Failed" | "COD" | "Verification Needed";
  status: "Pending" | "Confirmed" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";
  courier?: string;
  trackingId?: string;
  trxId?: string;
};

export const orders: Order[] = [
  {
    id: "NGR-1042",
    customer: "Tasnim Rahman",
    phone: "01711-223344",
    district: "Dhaka",
    date: "2025-05-26",
    items: 2,
    total: 5380,
    payment: "bKash",
    paymentStatus: "Verification Needed",
    status: "Pending",
  },
  {
    id: "NGR-1041",
    customer: "Nusrat Jahan",
    phone: "01812-556677",
    district: "Chattogram",
    date: "2025-05-26",
    items: 1,
    total: 3290,
    payment: "COD",
    paymentStatus: "COD",
    status: "Confirmed",
    courier: "Steadfast",
    trackingId: "SF-88291",
  },
  {
    id: "NGR-1040",
    customer: "Mehnaz Karim",
    phone: "01911-998877",
    district: "Sylhet",
    date: "2025-05-25",
    items: 3,
    total: 8470,
    payment: "Nagad",
    paymentStatus: "Paid",
    status: "Shipped",
    courier: "Pathao",
    trackingId: "PT-44120",
  },
  {
    id: "NGR-1039",
    customer: "Rabeya Sultana",
    phone: "01711-334455",
    district: "Dhaka",
    date: "2025-05-25",
    items: 1,
    total: 2690,
    payment: "bKash",
    paymentStatus: "Paid",
    status: "Delivered",
    courier: "Steadfast",
    trackingId: "SF-88200",
  },
  {
    id: "NGR-1038",
    customer: "Sumaiya Akter",
    phone: "01612-778899",
    district: "Khulna",
    date: "2025-05-24",
    items: 2,
    total: 5180,
    payment: "COD",
    paymentStatus: "COD",
    status: "Processing",
  },
  {
    id: "NGR-1037",
    customer: "Farzana Hoque",
    phone: "01511-112233",
    district: "Rajshahi",
    date: "2025-05-24",
    items: 1,
    total: 3490,
    payment: "Rocket",
    paymentStatus: "Pending",
    status: "Pending",
  },
  {
    id: "NGR-1036",
    customer: "Anika Tabassum",
    phone: "01811-445566",
    district: "Dhaka",
    date: "2025-05-23",
    items: 4,
    total: 11280,
    payment: "Card",
    paymentStatus: "Paid",
    status: "Delivered",
    courier: "RedX",
    trackingId: "RX-22019",
  },
  {
    id: "NGR-1035",
    customer: "Sadia Islam",
    phone: "01711-667788",
    district: "Cumilla",
    date: "2025-05-23",
    items: 1,
    total: 1690,
    payment: "COD",
    paymentStatus: "Failed",
    status: "Cancelled",
  },
];

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder: string;
  status: "Active" | "Flagged";
};

export const customers: Customer[] = [
  {
    id: "u1",
    name: "Tasnim Rahman",
    phone: "01711-223344",
    email: "tasnim@example.com",
    totalOrders: 7,
    totalSpend: 28400,
    lastOrder: "2025-05-26",
    status: "Active",
  },
  {
    id: "u2",
    name: "Nusrat Jahan",
    phone: "01812-556677",
    email: "nusrat@example.com",
    totalOrders: 4,
    totalSpend: 14290,
    lastOrder: "2025-05-26",
    status: "Active",
  },
  {
    id: "u3",
    name: "Mehnaz Karim",
    phone: "01911-998877",
    email: "mehnaz@example.com",
    totalOrders: 12,
    totalSpend: 46180,
    lastOrder: "2025-05-25",
    status: "Active",
  },
  {
    id: "u4",
    name: "Sadia Islam",
    phone: "01711-667788",
    email: "sadia@example.com",
    totalOrders: 1,
    totalSpend: 1690,
    lastOrder: "2025-05-23",
    status: "Flagged",
  },
  {
    id: "u5",
    name: "Anika Tabassum",
    phone: "01811-445566",
    email: "anika@example.com",
    totalOrders: 9,
    totalSpend: 31900,
    lastOrder: "2025-05-23",
    status: "Active",
  },
];

export const coupons = [
  {
    code: "NONGOR10",
    type: "Percentage",
    value: 10,
    minOrder: 2000,
    expiry: "2025-12-31",
    uses: 142,
    active: true,
  },
  {
    code: "FESTIVE500",
    type: "Flat",
    value: 500,
    minOrder: 3000,
    expiry: "2025-08-31",
    uses: 56,
    active: true,
  },
  {
    code: "FREESHIP",
    type: "Free Delivery",
    value: 0,
    minOrder: 2500,
    expiry: "2025-07-15",
    uses: 89,
    active: true,
  },
  {
    code: "WELCOME15",
    type: "Percentage",
    value: 15,
    minOrder: 1500,
    expiry: "2025-06-30",
    uses: 312,
    active: false,
  },
];

export const reviews = [
  {
    id: "r1",
    product: "Maroon Nakshi Handmade Kurti",
    customer: "Tasnim R.",
    rating: 5,
    text: "The stitching detail is gorgeous, fabric feels premium.",
    status: "Approved",
  },
  {
    id: "r2",
    product: "Golden Thread Festive Kurti",
    customer: "Nusrat J.",
    rating: 5,
    text: "Wore it for Eid and got so many compliments.",
    status: "Approved",
  },
  {
    id: "r3",
    product: "Ivory Floral Cotton Kurti",
    customer: "Sadia I.",
    rating: 3,
    text: "Nice but size ran a bit small.",
    status: "Pending",
  },
  {
    id: "r4",
    product: "Wine Red Handloom Kurti",
    customer: "Mehnaz K.",
    rating: 5,
    text: "Handloom quality is exceptional.",
    status: "Approved",
  },
];

export const salesChart = [
  { day: "Mon", sales: 12400 },
  { day: "Tue", sales: 18900 },
  { day: "Wed", sales: 15200 },
  { day: "Thu", sales: 22100 },
  { day: "Fri", sales: 28400 },
  { day: "Sat", sales: 34200 },
  { day: "Sun", sales: 29800 },
];

export const orderStatusChart = [
  { name: "Delivered", value: 142 },
  { name: "Shipped", value: 38 },
  { name: "Processing", value: 24 },
  { name: "Pending", value: 12 },
];
