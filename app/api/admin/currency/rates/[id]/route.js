import { json, requireAdmin, prisma } from '@/app/api/admin/_utils';

export async function DELETE(request, { params }) {
  try {
    // Verify admin access
    const auth = requireAdmin(request.headers);
    if (!auth.ok) return auth.response;

    const { id } = params;

    // Check if rate exists
    const existingRate = await prisma.currency_rates.findUnique({
      where: { id }
    });

    if (!existingRate) {
      return json({ error: 'Currency rate not found' }, 404);
    }

    // Delete the rate
    await prisma.currency_rates.delete({
      where: { id }
    });

    return json({ message: 'Currency rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting currency rate:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}