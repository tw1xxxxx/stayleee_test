import { createClient } from 'redis';

const USERS_KEY = 'users';
const ORDERS_KEY = 'orders';
const COLLECTIONS_KEY = 'collections';
const PRODUCTS_KEY = 'products';
const FILTERS_KEY = 'filters';
const PROJECTS_KEY = 'projects';
const GIFTS_KEY = 'gifts';
const TRANSACTIONS_KEY = 'transactions';

const kvBaseUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const useKv = !!kvBaseUrl && !!kvToken;
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
const useRedis = !!redisUrl;

type RedisClient = ReturnType<typeof createClient>;
let redisClientPromise: Promise<RedisClient | null> | null = null;

export const getRedisClient = async (): Promise<RedisClient | null> => {
  if (!useRedis || !redisUrl) {
    return null;
  }
  
  if (redisClientPromise) {
    return redisClientPromise;
  }

  redisClientPromise = (async () => {
    try {
      console.log('Connecting to Redis:', redisUrl.replace(/:[^:@]+@/, ':***@'));
      const client = createClient({ 
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 5) {
              console.error('Redis reconnect failed');
              return false;
            }
            return Math.min(retries * 500, 2000);
          }
        }
      });
      
      client.on('error', (err) => {
        if (!err.message.includes('Socket closed')) {
          console.error('Redis Client Error:', err.message);
        }
      });
      
      await client.connect();
      console.log('Redis connected successfully');
      return client;
    } catch (error: any) {
      console.warn('Redis connection failed:', error.message);
      redisClientPromise = null;
      return null;
    }
  })();

  return redisClientPromise;
};

export const isRedisAvailable = useRedis;

const kvGetJson = async <T,>(key: string): Promise<T | undefined> => {
  if (!useKv || !kvBaseUrl || !kvToken) {
    return undefined;
  }
  try {
    const response = await fetch(`${kvBaseUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    if (data?.result === null || data?.result === undefined) {
      return undefined;
    }
    return JSON.parse(data.result);
  } catch (error) {
    console.error('Error reading KV:', error);
    return undefined;
  }
};

const kvSetJson = async (key: string, value: unknown): Promise<boolean> => {
  if (!useKv || !kvBaseUrl || !kvToken) {
    return false;
  }
  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    const response = await fetch(`${kvBaseUrl}/set/${encodeURIComponent(key)}/${encoded}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    if (!response.ok) {
      throw new Error('KV write failed');
    }
    return true;
  } catch (error) {
    console.error('Error writing KV:', error);
    return false;
  }
};

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
    if (useKv) {
      const users = await kvGetJson<User[]>(USERS_KEY);
      if (Array.isArray(users)) return users;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(USERS_KEY);
      if (data) {
        const users = JSON.parse(data);
        if (Array.isArray(users)) return users;
      }
    }
    return [];
  },

  getOrders: async (): Promise<Order[]> => {
    if (useKv) {
      const orders = await kvGetJson<Order[]>(ORDERS_KEY);
      if (Array.isArray(orders)) return orders;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(ORDERS_KEY);
      if (data) {
        const orders = JSON.parse(data);
        if (Array.isArray(orders)) return orders;
      }
    }
    return [];
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
    if (useKv) await kvSetJson(USERS_KEY, users);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(USERS_KEY, JSON.stringify(users));
  },

  createOrder: async (order: Order): Promise<void> => {
    const orders = await db.getOrders();
    orders.push(order);
    if (useKv) await kvSetJson(ORDERS_KEY, orders);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(ORDERS_KEY, JSON.stringify(orders));
  },

  deleteOrder: async (id: string): Promise<void> => {
    const orders = await db.getOrders();
    const filtered = orders.filter(o => o.id !== id);
    if (useKv) await kvSetJson(ORDERS_KEY, filtered);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(ORDERS_KEY, JSON.stringify(filtered));
  },

  updateOrder: async (order: Order): Promise<void> => {
    const orders = await db.getOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
      if (useKv) await kvSetJson(ORDERS_KEY, orders);
      const redisClient = await getRedisClient();
      if (redisClient) await redisClient.set(ORDERS_KEY, JSON.stringify(orders));
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
    if (useKv) {
      const collections = await kvGetJson<Collection[]>(COLLECTIONS_KEY);
      if (Array.isArray(collections)) return collections;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(COLLECTIONS_KEY);
      if (data) {
        const collections = JSON.parse(data);
        if (Array.isArray(collections)) return collections;
      }
    }
    return [];
  },

  saveCollections: async (collections: Collection[]): Promise<void> => {
    if (useKv) await kvSetJson(COLLECTIONS_KEY, collections);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(COLLECTIONS_KEY, JSON.stringify(collections));
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
    try {
      if (useKv) {
        const products = await kvGetJson<Product[]>(PRODUCTS_KEY);
        if (Array.isArray(products)) return products;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        const data = await redisClient.get(PRODUCTS_KEY);
        if (data) {
          // If data is already an object (some Redis clients do this automatically)
          if (typeof data === 'object') return Array.isArray(data) ? data : [];
          
          const products = JSON.parse(data);
          if (Array.isArray(products)) return products;
        }
      }
    } catch (error) {
      console.error('CRITICAL ERROR reading products from Redis:', error);
    }
    return [];
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    // Ensure all products have properly formatted images arrays before saving
    const sanitizedProducts = products.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : (p.image ? [p.image] : []),
      colors: Array.isArray(p.colors) ? p.colors.map(c => ({
        ...c,
        images: Array.isArray(c.images) ? c.images.filter(Boolean) : []
      })) : []
    }));

    if (useKv) await kvSetJson(PRODUCTS_KEY, sanitizedProducts);
    const redisClient = await getRedisClient();
    if (redisClient) {
      try {
        await redisClient.set(PRODUCTS_KEY, JSON.stringify(sanitizedProducts));
      } catch (error) {
        console.error('Redis save error:', error);
        throw error;
      }
    }
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
    if (useKv) {
      const projects = await kvGetJson<Project[]>(PROJECTS_KEY);
      if (Array.isArray(projects)) return projects.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(PROJECTS_KEY);
      if (data) {
        const projects = JSON.parse(data);
        if (Array.isArray(projects)) return projects.sort((a, b) => (a.order || 0) - (b.order || 0));
      }
    }
    return [];
  },

  saveProjects: async (projects: Project[]): Promise<void> => {
    if (useKv) await kvSetJson(PROJECTS_KEY, projects);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(PROJECTS_KEY, JSON.stringify(projects));
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
    if (useKv) {
      const filters = await kvGetJson<Filter[]>(FILTERS_KEY);
      if (Array.isArray(filters)) return filters;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(FILTERS_KEY);
      if (data) {
        const filters = JSON.parse(data);
        if (Array.isArray(filters)) return filters;
      }
    }
    return [];
  },

  saveFilter: async (filter: Filter): Promise<void> => {
    const filters = await db.getFilters();
    const index = filters.findIndex(f => f.id === filter.id);
    if (index >= 0) filters[index] = filter;
    else filters.push(filter);
    if (useKv) await kvSetJson(FILTERS_KEY, filters);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(FILTERS_KEY, JSON.stringify(filters));
  },

  deleteFilter: async (id: string): Promise<void> => {
    const filters = await db.getFilters();
    const filtered = filters.filter(f => f.id !== id);
    if (useKv) await kvSetJson(FILTERS_KEY, filtered);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(FILTERS_KEY, JSON.stringify(filtered));
  },

  getTransactions: async (): Promise<Transaction[]> => {
    if (useKv) {
      const transactions = await kvGetJson<Transaction[]>(TRANSACTIONS_KEY);
      if (Array.isArray(transactions)) return transactions;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(TRANSACTIONS_KEY);
      if (data) {
        const transactions = JSON.parse(data);
        if (Array.isArray(transactions)) return transactions;
      }
    }
    return [];
  },

  createTransaction: async (transaction: Transaction): Promise<void> => {
    const transactions = await db.getTransactions();
    transactions.push(transaction);
    if (useKv) await kvSetJson(TRANSACTIONS_KEY, transactions);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(TRANSACTIONS_KEY, JSON.stringify(transactions));
  },

  updateTransaction: async (transaction: Transaction): Promise<void> => {
    const transactions = await db.getTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    if (index >= 0) {
      transactions[index] = transaction;
      if (useKv) await kvSetJson(TRANSACTIONS_KEY, transactions);
      const redisClient = await getRedisClient();
      if (redisClient) await redisClient.set(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  },

  getGifts: async (): Promise<Gift[]> => {
    if (useKv) {
      const gifts = await kvGetJson<Gift[]>(GIFTS_KEY);
      if (Array.isArray(gifts)) return gifts;
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(GIFTS_KEY);
      if (data) {
        const gifts = JSON.parse(data);
        if (Array.isArray(gifts)) return gifts;
      }
    }
    return [];
  },

  saveGifts: async (gifts: Gift[]): Promise<void> => {
    if (useKv) await kvSetJson(GIFTS_KEY, gifts);
    const redisClient = await getRedisClient();
    if (redisClient) await redisClient.set(GIFTS_KEY, JSON.stringify(gifts));
  }
};