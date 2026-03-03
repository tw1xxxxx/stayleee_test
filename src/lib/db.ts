
import fs from 'fs';
import path from 'path';
import { createClient } from 'redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const FILTERS_FILE = path.join(DATA_DIR, 'filters.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const GIFTS_FILE = path.join(DATA_DIR, 'gifts.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
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
  if (!redisClientPromise) {
    const client = createClient({ url: redisUrl });
    redisClientPromise = client.connect()
      .then(() => client)
      .catch((error) => {
        console.error('Error connecting Redis:', error);
        return null;
      });
  }
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
      if (Array.isArray(users) && users.length > 0) {
        return users;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(USERS_KEY);
      if (data) {
        try {
          const users = JSON.parse(data);
          if (Array.isArray(users) && users.length > 0) {
            return users;
          }
        } catch (error) {
          console.error('Error parsing users from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  },

  getOrders: async (): Promise<Order[]> => {
    if (useKv) {
      const orders = await kvGetJson<Order[]>(ORDERS_KEY);
      if (Array.isArray(orders) && orders.length > 0) {
        return orders;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(ORDERS_KEY);
      if (data) {
        try {
          const orders = JSON.parse(data);
          if (Array.isArray(orders) && orders.length > 0) {
            return orders;
          }
        } catch (error) {
          console.error('Error parsing orders from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading orders file:', error);
      return [];
    }
  },

  getUserByEmail: async (email: string): Promise<User | undefined> => {
    const users = await db.getUsers();
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  },

  createUser: async (user: User): Promise<boolean> => {
    try {
      const users = await db.getUsers();
      
      // Check for existing user with same email just in case
      const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
      if (exists) {
        console.log(`User already exists: ${user.email}`);
        return true; // Consider it success if already exists
      }
      
      users.push(user);
      
      if (useKv) {
        const saved = await kvSetJson(USERS_KEY, users);
        if (saved) {
          console.log(`User created in KV: ${user.email}`);
          return true;
        }
      }
      
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(USERS_KEY, JSON.stringify(users));
        console.log(`User created in Redis: ${user.email}`);
        return true;
      }
      
      // Fallback to file system
      try {
        await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        console.log(`User created in File System: ${user.email}`);
        return true;
      } catch (fileError) {
        console.error('Error writing to users file:', fileError);
        return false;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  },

  createOrder: async (order: Order): Promise<void> => {
    try {
      const orders = await db.getOrders();
      orders.push(order);
      if (useKv) {
        const saved = await kvSetJson(ORDERS_KEY, orders);
        if (saved) {
          console.log(`Order created: ${order.id} for user ${order.userId}`);
          return;
        }
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(ORDERS_KEY, JSON.stringify(orders));
        console.log(`Order created: ${order.id} for user ${order.userId}`);
        return;
      }
      await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
      console.log(`Order created: ${order.id} for user ${order.userId}`);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  },



  deleteOrder: async (id: string): Promise<void> => {
    try {
      const orders = await db.getOrders();
      const filtered = orders.filter(o => o.id !== id);
      if (useKv) {
        const saved = await kvSetJson(ORDERS_KEY, filtered);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(ORDERS_KEY, JSON.stringify(filtered));
        return;
      }
      await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  },

  updateOrder: async (order: Order): Promise<void> => {
    try {
      const orders = await db.getOrders();
      const index = orders.findIndex(o => o.id === order.id);
      
      if (index >= 0) {
        orders[index] = order;
        
        if (useKv) {
          const saved = await kvSetJson(ORDERS_KEY, orders);
          if (saved) return;
        }
        const redisClient = await getRedisClient();
        if (redisClient) {
          await redisClient.set(ORDERS_KEY, JSON.stringify(orders));
          return;
        }
        await fs.promises.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
        // console.log(`Order updated: ${order.id}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  },
  
  getUserOrders: async (userId: string): Promise<Order[]> => {
    const orders = await db.getOrders();
    return orders.filter(order => order.userId === userId);
  },
  
  userExists: async (email: string): Promise<boolean> => {
    return !!(await db.getUserByEmail(email));
  },

  // Collections
  getCollections: async (): Promise<Collection[]> => {
    if (useKv) {
      const collections = await kvGetJson<Collection[]>(COLLECTIONS_KEY);
      if (Array.isArray(collections) && collections.length > 0) {
        return collections;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(COLLECTIONS_KEY);
      if (data) {
        try {
          const collections = JSON.parse(data);
          if (Array.isArray(collections) && collections.length > 0) {
            return collections;
          }
        } catch (error) {
          console.error('Error parsing collections from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(COLLECTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading collections file:', error);
      return [];
    }
  },

  saveCollection: async (collection: Collection): Promise<void> => {
    try {
      const collections = await db.getCollections();
      const index = collections.findIndex(c => c.id === collection.id);
      
      if (index >= 0) {
        collections[index] = collection;
      } else {
        collections.push(collection);
      }

      await db.saveCollections(collections);
    } catch (error) {
      console.error('Error saving collection:', error);
    }
  },

  saveCollections: async (collections: Collection[]): Promise<void> => {
    try {
      if (useKv) {
        const saved = await kvSetJson(COLLECTIONS_KEY, collections);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(COLLECTIONS_KEY, JSON.stringify(collections));
        return;
      }
      await fs.promises.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
    } catch (error) {
      console.error('Error saving collections:', error);
    }
  },

  deleteCollection: async (id: string): Promise<void> => {
    try {
      const collections = await db.getCollections();
      const filtered = collections.filter(c => c.id !== id);

      if (useKv) {
        const saved = await kvSetJson(COLLECTIONS_KEY, filtered);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(COLLECTIONS_KEY, JSON.stringify(filtered));
        return;
      }
      await fs.promises.writeFile(COLLECTIONS_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    if (useKv) {
      const products = await kvGetJson<Product[]>(PRODUCTS_KEY);
      if (Array.isArray(products) && products.length > 0) {
        return products;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(PRODUCTS_KEY);
      if (data) {
        try {
          const products = JSON.parse(data);
          if (Array.isArray(products) && products.length > 0) {
            return products;
          }
        } catch (error) {
          console.error('Error parsing products from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products file:', error);
      return [];
    }
  },

  saveProducts: async (products: Product[]): Promise<void> => {
    try {
      if (useKv) {
        const saved = await kvSetJson(PRODUCTS_KEY, products);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(PRODUCTS_KEY, JSON.stringify(products));
        return;
      }
      await fs.promises.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    } catch (error) { 
      console.error('Error saving products:', error);
    }
  },
  
  saveProduct: async (product: Product): Promise<void> => {
    try {
      const products = await db.getProducts();
      const index = products.findIndex(p => p.id === product.id);
      
      if (index >= 0) {
        products[index] = product;
      } else {
        products.push(product);
      }

      await db.saveProducts(products);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  },
  deleteProduct: async (id: string): Promise<void> => {
    try {
      const products = await db.getProducts();
      const filtered = products.filter(p => p.id !== id);

      if (useKv) {
        const saved = await kvSetJson(PRODUCTS_KEY, filtered);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(PRODUCTS_KEY, JSON.stringify(filtered));
        return;
      }
      await fs.promises.writeFile(PRODUCTS_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    if (useKv) {
      const projects = await kvGetJson<Project[]>(PROJECTS_KEY);
      if (Array.isArray(projects) && projects.length > 0) {
        return projects;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(PROJECTS_KEY);
      if (data) {
        try {
          const projects = JSON.parse(data);
          if (Array.isArray(projects) && projects.length > 0) {
            return projects;
          }
        } catch (error) {
          console.error('Error parsing projects from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(PROJECTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading projects file:', error);
      return [];
    }
  },

  // Filters
  getFilters: async (): Promise<Filter[]> => {
    if (useKv) {
      const filters = await kvGetJson<Filter[]>(FILTERS_KEY);
      if (Array.isArray(filters) && filters.length > 0) {
        return filters;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(FILTERS_KEY);
      if (data) {
        try {
          const filters = JSON.parse(data);
          if (Array.isArray(filters) && filters.length > 0) {
            return filters;
          }
        } catch (error) {
          console.error('Error parsing filters from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(FILTERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading filters file:', error);
      return [];
    }
  },

  saveFilter: async (filter: Filter): Promise<void> => {
    try {
      const filters = await db.getFilters();
      const index = filters.findIndex(f => f.id === filter.id);

      if (index >= 0) {
        filters[index] = filter;
      } else {
        filters.push(filter);
      }

      if (useKv) {
        const saved = await kvSetJson(FILTERS_KEY, filters);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(FILTERS_KEY, JSON.stringify(filters));
        return;
      }
      await fs.promises.writeFile(FILTERS_FILE, JSON.stringify(filters, null, 2));
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  },

  deleteFilter: async (id: string): Promise<void> => {
    try {
      const filters = await db.getFilters();
      const filtered = filters.filter(f => f.id !== id);

      if (useKv) {
        const saved = await kvSetJson(FILTERS_KEY, filtered);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(FILTERS_KEY, JSON.stringify(filtered));
        return;
      }
      await fs.promises.writeFile(FILTERS_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    if (useKv) {
      const transactions = await kvGetJson<Transaction[]>(TRANSACTIONS_KEY);
      if (Array.isArray(transactions) && transactions.length > 0) {
        return transactions;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(TRANSACTIONS_KEY);
      if (data) {
        try {
          const transactions = JSON.parse(data);
          if (Array.isArray(transactions) && transactions.length > 0) {
            return transactions;
          }
        } catch (error) {
          console.error('Error parsing transactions from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(TRANSACTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist yet (first run), return empty
      console.error('Error reading transactions file:', error);
      return [];
    }
  },

  createTransaction: async (transaction: Transaction): Promise<void> => {
    try {
      const transactions = await db.getTransactions();
      transactions.push(transaction);

      if (useKv) {
        const saved = await kvSetJson(TRANSACTIONS_KEY, transactions);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(TRANSACTIONS_KEY, JSON.stringify(transactions));
        return;
      }
      await fs.promises.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  },

  updateTransaction: async (transaction: Transaction): Promise<void> => {
    try {
      const transactions = await db.getTransactions();
      const index = transactions.findIndex(t => t.id === transaction.id);
      
      if (index >= 0) {
        transactions[index] = transaction;
        
        if (useKv) {
          const saved = await kvSetJson(TRANSACTIONS_KEY, transactions);
          if (saved) return;
        }
        const redisClient = await getRedisClient();
        if (redisClient) {
          await redisClient.set(TRANSACTIONS_KEY, JSON.stringify(transactions));
          return;
        }
        await fs.promises.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  },

  saveProject: async (project: Project): Promise<void> => {
    try {
      const projects = await db.getProjects();
      const index = projects.findIndex(p => p.id === project.id);
      
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }

      // Sort by order
      projects.sort((a, b) => a.order - b.order);

      await db.saveProjects(projects);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  },

  saveProjects: async (projects: Project[]): Promise<void> => {
    try {
      if (useKv) {
        const saved = await kvSetJson(PROJECTS_KEY, projects);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(PROJECTS_KEY, JSON.stringify(projects));
        return;
      }
      await fs.promises.writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  },

  // Gifts
  getGifts: async (): Promise<Gift[]> => {
    if (useKv) {
      const gifts = await kvGetJson<Gift[]>(GIFTS_KEY);
      if (Array.isArray(gifts) && gifts.length > 0) {
        return gifts;
      }
    }
    const redisClient = await getRedisClient();
    if (redisClient) {
      const data = await redisClient.get(GIFTS_KEY);
      if (data) {
        try {
          const gifts = JSON.parse(data);
          if (Array.isArray(gifts) && gifts.length > 0) {
            return gifts;
          }
        } catch (error) {
          console.error('Error parsing gifts from Redis:', error);
        }
      }
    }
    try {
      const data = await fs.promises.readFile(GIFTS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading gifts file:', error);
      return [];
    }
  },

  saveGifts: async (gifts: Gift[]): Promise<void> => {
    try {
      if (useKv) {
        const saved = await kvSetJson(GIFTS_KEY, gifts);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(GIFTS_KEY, JSON.stringify(gifts));
        return;
      }
      await fs.promises.writeFile(GIFTS_FILE, JSON.stringify(gifts, null, 2));
    } catch (error) {
      console.error('Error saving gifts:', error);
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    try {
      const projects = await db.getProjects();
      const filtered = projects.filter(p => p.id !== id);

      if (useKv) {
        const saved = await kvSetJson(PROJECTS_KEY, filtered);
        if (saved) return;
      }
      const redisClient = await getRedisClient();
      if (redisClient) {
        await redisClient.set(PROJECTS_KEY, JSON.stringify(filtered));
        return;
      }
      await fs.promises.writeFile(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  }
};
