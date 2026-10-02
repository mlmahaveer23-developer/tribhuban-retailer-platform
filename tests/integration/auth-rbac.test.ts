import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '@/lib/store/repository';
import { AppUser } from '@/types/auth';

describe('Data Isolation & Server-Side Authorization', () => {
  const coordinatorA: AppUser = {
    id: 'coord_A',
    email: 'coordA@tribhuban.com',
    full_name: 'Coordinator A',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const coordinatorB: AppUser = {
    id: 'coord_B',
    email: 'coordB@tribhuban.com',
    full_name: 'Coordinator B',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const adminUser: AppUser = {
    id: 'admin_1',
    email: 'admin@tribhuban.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    repository.resetStore();
  });

  it('enforces coordinator data isolation (IDOR protection)', async () => {
    // Coordinator A creates a retailer
    const retailerA = await repository.createRetailer(
      {
        business_name: "Store Owned By A",
        owner_name: 'Owner A',
        phone: '+91 99999 11111',
        address: 'Sector 1',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        business_type: 'Kirana',
        years_in_business: 2,
      },
      coordinatorA
    );

    // Coordinator A can retrieve it
    const fetchedByA = await repository.getRetailerById(retailerA.id, coordinatorA);
    expect(fetchedByA?.id).toBe(retailerA.id);

    // Coordinator B attempting to access Coordinator A's retailer is rejected
    await expect(repository.getRetailerById(retailerA.id, coordinatorB)).rejects.toThrow(
      'Access denied: Coordinator is not assigned to this retailer.'
    );

    // Admin can access all retailers
    const fetchedByAdmin = await repository.getRetailerById(retailerA.id, adminUser);
    expect(fetchedByAdmin?.id).toBe(retailerA.id);
  });

  it('prevents unauthorized coordinator from autosaving or submitting surveys for another coordinator retailer', async () => {
    // Coordinator A creates a retailer
    const retailerA = await repository.createRetailer(
      {
        business_name: 'Store Alpha',
        owner_name: 'Owner Alpha',
        phone: '+91 98888 22222',
        address: 'MG Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302002',
        business_type: 'Supermarket',
        years_in_business: 4,
      },
      coordinatorA
    );

    // Qualify the retailer
    await repository.saveQualification(
      retailerA.id,
      {
        monthlyGrocerySales: '₹3–5 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'High',
      },
      coordinatorA
    );

    // Coordinator B attempting to autosave survey for Store Alpha is rejected
    await expect(
      repository.autosaveSurvey(
        retailerA.id,
        2,
        { q_understanding_clarity: 'VERY_CLEAR' },
        null,
        null,
        coordinatorB
      )
    ).rejects.toThrow('Access denied: Coordinator is not assigned to this retailer.');

    // Internal assessment is never exposed to coordinators
    const assessmentForA = await repository.getInternalAssessment(retailerA.id, coordinatorA);
    expect(assessmentForA).toBeNull();

    const assessmentForB = await repository.getInternalAssessment(retailerA.id, coordinatorB);
    expect(assessmentForB).toBeNull();
  });
});
