import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(process.cwd(), 'data');

const getFilePath = (key: string) => join(DATA_DIR, `${key}.json`);

const readJsonFile = async <T,>(key: string): Promise<T | undefined> => {
  try {
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading file ${key}:`, error);
  }
  return undefined;
};

const writeJsonFile = async (key: string, value: unknown): Promise<void> => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    const filePath = getFilePath(key);
    await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file ${key}:`, error);
  }
};

const USERS_KEY = 'users';
const ORDERS_KEY = 'orders';
const COLLECTIONS_KEY = 'collections';
const PRODUCTS_KEY = 'products';
const FILTERS_KEY = 'filters';
const PROJECTS_KEY = 'projects';
const GIFTS_KEY = 'gifts';
const TRANSACTIONS_KEY = 'transactions';
const OTP_KEY_PREFIX = 'otp_';

export interface OtpData {
  code: string;
  expires: number;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  address: string;
  deliveryType?: 'delivery' | 'pickup';
  deliveryFee?: number;
  comment?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  paymentId?: string;
  paymentStatus?: 'pending' | 'succeeded' | 'canceled';
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'canceled';
  paymentId: string;
  createdAt: string;
  type: 'payment';
}

export interface ProductColor {
  name: string;
  value: string;
  label: string;
  images?: string[];
  sizes?: string[];
}

export interface ProductDetails {
  material?: string;
  characteristics?: string;
  article?: string;
}

export interface ProductVariant {
  id: string;
  size?: string;
  colorName?: string;
  price?: number;
  sku?: string;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  description?: string;
  filterIds?: string[];
  tags?: string[];
  sizes?: string[];
  colors?: ProductColor[];
  details?: ProductDetails;
  variants?: ProductVariant[];
  collectionImage?: string;
}

export interface Filter {
  id: string;
  name: string;
  slug: string;
}

export interface CollectionSection {
  id: string;
  title: string;
  productIds: string[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  sections: CollectionSection[];
  slug: string;
  image?: string;
}

export interface Project {
  id: string;
  type: 'portfolio' | 'promo';
  title?: string;
  image?: string;
  image2?: string;
  imageLayout?: 'single' | 'double';
  text?: string;
  order: number;
}

export interface Gift {
  id: string;
  threshold: number;
  title: string;
  description: string;
  image: string;
  price: number;
}

export const db = {
  getUsers: async (): Promise<User[]> => {
    const users = await readJsonFile<User[]>(USERS_KEY);
    return Array.isArray(users) ? users : [];
  },

  getOrders: async (): Promise<Order[]> => {
    const orders = await readJsonFile<Order[]>(ORDERS_KEY);
    return Array.isArray(orders) ? orders : [];
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const users = await db.getUsers();
    const normalizedEmail = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === normalizedEmail);
  },

  createUser: async (user: User): Promise<void> => {
    const users = await db.getUsers();
    if (!users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      users.push(user);
    }
    await writeJsonFile(USERS_KEY, users);
  },

  updateUser: async (user: User): Promise<void> => {
    const users = await db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      await writeJsonFile(USERS_KEY, users);
    }
  },

  createOrder: async (order: Order): Promise<void> => {
    const orders = await db.getOrders();
    orders.push(order);
    await writeJsonFile(ORDERS_KEY, orders);
  },

  deleteOrder: async (id: string): Promise<void> => {
    const orders = await db.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    await writeJsonFile(ORDERS_KEY, filtered);
  },

  updateOrder: async (order: Order): Promise<void> => {
    const orders = await db.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
      await writeJsonFile(ORDERS_KEY, orders);
    }
  },
  
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const orders = await db.getOrders();
    return orders.filter(order => order.userId === userId);
  },
  
  userExists: async (email: string): Promise<boolean> => {
    return !!(await db.getUserByEmail(email));
  },

  getCollections: async (): Promise<Collection[]> => {
    const collections = await readJsonFile<Collection[]>(COLLECTIONS_KEY);
    return Array.isArray(collections) ? collections : [];
  },

  saveCollections: async (collections: Collection[]): Promise<void> => {
    await writeJsonFile(COLLECTIONS_KEY, collections);
  },

  saveCollection: async (collection: Collection): Promise<void> => {
    const collections = await db.getCollections();
    const index = collections.findIndex(c => c.id === collection.id);
    if (index >= 0) collections[index] = collection;
    else collections.push(collection);
    await db.saveCollections(collections);
  },

  deleteCollection: async (id: string): Promise<void> => {
    const collections = await db.getCollections();
    const filtered = collections.filter(c => c.id !== id);
    await db.saveCollections(filtered);
  },

  getProducts: async (): Promise<Product[]> => {
    const products = await readJsonFile<Product[]>(PRODUCTS_KEY);
    return Array.isArray(products) ? products : [];
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    const sanitizedProducts = products.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : (p.image ? [p.image] : []),
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({
        ...c,
        images: Array.isArray(c.images) ? c.images.filter(Boolean) : []
      })) : []
    }));
    await writeJsonFile(PRODUCTS_KEY, sanitizedProducts);
  },
  
  saveProduct: async (product: Product): Promise<void> => {
    const products = await db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    await db.saveProducts(products);
  },

  deleteProduct: async (id: string): Promise<void> => {
    const products = await db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await db.saveProducts(filtered);
  },

  getProjects: async (): Promise<Project[]> => {
    const projects = await readJsonFile<Project[]>(PROJECTS_KEY);
    return Array.isArray(projects) ? projects.sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  },

  saveProjects: async (projects: Project[]): Promise<void> => {
    await writeJsonFile(PROJECTS_KEY, projects);
  },

  saveProject: async (project: Project): Promise<void> => {
    const projects = await db.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) projects[index] = project;
    else projects.push(project);
    projects.sort((a, b) => a.order - b.order);
    await db.saveProjects(projects);
  },

  deleteProject: async (id: string): Promise<void> => {
    const projects = await db.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    await db.saveProjects(filtered);
  },

  getFilters: async (): Promise<Filter[]> => {
    const filters = await readJsonFile<Filter[]>(FILTERS_KEY);
    return Array.isArray(filters) ? filters : [];
  },

  saveFilter: async (filter: Filter): Promise<void> => {
    const filters = await db.getFilters();
    const index = filters.findIndex(f => f.id === filter.id);
    if (index >= 0) filters[index] = filter;
    else filters.push(filter);
    await writeJsonFile(FILTERS_KEY, filters);
  },

  deleteFilter: async (id: string): Promise<void> => {
    const filters = await db.getFilters();
    const filtered = filters.filter(f => f.id !== id);
    await writeJsonFile(FILTERS_KEY, filtered);
  },

  getTransactions: async (): Promise<Transaction[]> => {
    const transactions = await readJsonFile<Transaction[]>(TRANSACTIONS_KEY);
    return Array.isArray(transactions) ? transactions : [];
  },

  createTransaction: async (transaction: Transaction): Promise<void> => {
    const transactions = await db.getTransactions();
    transactions.push(transaction);
    await writeJsonFile(TRANSACTIONS_KEY, transactions);
  },

  updateTransaction: async (transaction: Transaction): Promise<void> => {
    const transactions = await db.getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index >= 0) {
      transactions[index] = transaction;
      await writeJsonFile(TRANSACTIONS_KEY, transactions);
    }
  },

  getGifts: async (): Promise<Gift[]> => {
    const gifts = await readJsonFile<Gift[]>(GIFTS_KEY);
    return Array.isArray(gifts) ? gifts : [];
  },

  saveGifts: async (gifts: Gift[]): Promise<void> => {
    await writeJsonFile(GIFTS_KEY, gifts);
  },

  getOtp: async (email: string): Promise<OtpData | undefined> => {
    const key = `${OTP_KEY_PREFIX}${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return await readJsonFile<OtpData>(key);
  },

  saveOtp: async (email: string, otpData: OtpData): Promise<void> => {
    const key = `${OTP_KEY_PREFIX}${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    await writeJsonFile(key, otpData);
  },

  deleteOtp: async (email: string): Promise<void> => {
    const key = `${OTP_KEY_PREFIX}${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (error) {
        console.error(`Error deleting OTP file for ${email}:`, error);
      }
    }
  }
};
