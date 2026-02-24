import { v4 as uuidv4 } from 'uuid';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

if (!SHOP_ID || !SECRET_KEY) {
  console.warn('YooKassa credentials are not set in environment variables.');
}

const getAuthHeader = () => {
  const authString = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
  return `Basic ${authString}`;
};

export interface CreatePaymentParams {
  amount: {
    value: string;
    currency: string;
  };
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  capture: boolean;
  description: string;
  metadata?: Record<string, string>;
}

export const createYooKassaPayment = async (params: CreatePaymentParams) => {
  if (!SHOP_ID || !SECRET_KEY) {
    console.warn('YooKassa credentials are missing. Returning mock payment.');
    return {
      id: `mock_payment_${uuidv4()}`,
      status: 'pending',
      amount: params.amount,
      description: params.description,
      recipient: {
        account_id: 'mock_account',
        gateway_id: 'mock_gateway',
      },
      created_at: new Date().toISOString(),
      confirmation: {
        type: 'redirect',
        confirmation_url: params.confirmation.return_url, // Redirect back immediately
      },
      test: true,
      paid: false,
      refundable: false,
      metadata: params.metadata,
    };
  }

  const idempotenceKey = uuidv4();

  const response = await fetch(`${YOOKASSA_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Idempotence-Key': idempotenceKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`YooKassa API Error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};

export const getYooKassaPayment = async (paymentId: string) => {
  if (!SHOP_ID || !SECRET_KEY) {
    if (paymentId.startsWith('mock_payment_')) {
      return {
        id: paymentId,
        status: 'succeeded',
        paid: true,
        amount: {
          value: '1000.00',
          currency: 'RUB',
        },
        captured_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        description: 'Mock payment',
        metadata: {},
        payment_method: {
          type: 'bank_card',
          id: 'mock_card',
          saved: false,
        },
        recipient: {
          account_id: 'mock_account',
          gateway_id: 'mock_gateway',
        },
        refundable: true,
        test: true,
      };
    }
    throw new Error('YooKassa credentials are missing');
  }

  const response = await fetch(`${YOOKASSA_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`YooKassa API Error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
};
