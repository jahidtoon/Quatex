import { json, requireAdmin, prisma } from '@/app/api/admin/_utils';

export async function GET(request) {
  try {
    // Verify admin access (supports admin_token cookie, header token, ADMIN_TOKEN)
    const auth = requireAdmin(request.headers);
    if (!auth.ok) return auth.response;

    // Get all currency rates
    const rates = await prisma.currency_rates.findMany({
      orderBy: [
        { from_currency: 'asc' },
        { to_currency: 'asc' }
      ]
    });

    return json({ rates });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}

export async function POST(request) {
  try {
    // Verify admin access
    const auth = requireAdmin(request.headers);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { id, from_currency, to_currency, rate, min_amount, max_amount } = body;

    if (!from_currency || !to_currency || !rate) {
      return json({ error: 'Missing required fields' }, 400);
    }

    if (from_currency === to_currency) {
      return json({ error: 'From and to currencies cannot be the same' }, 400);
    }

    const rateValue = parseFloat(rate);
    const minAmountValue = min_amount ? parseFloat(min_amount) : 1;
    const maxAmountValue = max_amount ? parseFloat(max_amount) : 1000000;

    if (rateValue <= 0) {
      return json({ error: 'Rate must be greater than 0' }, 400);
    }

    if (minAmountValue >= maxAmountValue) {
      return json({ error: 'Min amount must be less than max amount' }, 400);
    }

    if (id) {
      // Update existing rate
      const existingRate = await prisma.currency_rates.findUnique({
        where: { id }
      });

      if (!existingRate) {
        return json({ error: 'Currency rate not found' }, 404);
      }

      const updatedRate = await prisma.currency_rates.update({
        where: { id },
        data: {
          rate: rateValue,
          min_amount: minAmountValue,
          max_amount: maxAmountValue,
          last_updated: new Date()
        }
      });

      return json({ rate: updatedRate });
    } else {
      // Create new rate
      // Check if rate already exists
      const existingRate = await prisma.currency_rates.findUnique({
        where: {
          from_currency_to_currency: {
            from_currency,
            to_currency
          }
        }
      });

      if (existingRate) {
        return json({ error: 'Currency rate already exists' }, 409);
      }

      const newRate = await prisma.currency_rates.create({
        data: {
          from_currency,
          to_currency,
          rate: rateValue,
          min_amount: minAmountValue,
          max_amount: maxAmountValue
        }
      });

      return json({ rate: newRate });
    }
  } catch (error) {
    console.error('Error saving currency rate:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}