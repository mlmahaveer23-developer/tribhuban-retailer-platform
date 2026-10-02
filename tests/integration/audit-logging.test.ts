import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '@/lib/store/repository';
import { AppUser } from '@/types/auth';

describe('Audit Event Pipeline', () => {
  const admin: AppUser = {
    id: 'user_admin_1',
    email: 'admin@tribhuban.com',
    full_name: 'Mahaveer Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const coordinator: AppUser = {
    id: 'user_coord_1',
    email: 'coordinator@tribhuban.com',
    full_name: 'Suresh Coordinator',
    role: 'coordinator',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    repository.resetStore();
  });

  it('records audit events for important lifecycle transitions', async () => {
    // 1. Create Retailer
    const ret = await repository.createRetailer(
      {
        business_name: 'Audit Store Test',
        owner_name: 'Test Owner',
        phone: '+91 99999 22222',
        address: 'Bapu Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302015',
        business_type: 'Kirana',
        years_in_business: 4,
      },
      coordinator
    );

    // 2. Qualify Retailer
    await repository.saveQualification(
      ret.id,
      {
        monthlyGrocerySales: '₹2–3 lakh',
        tribhubanSalesPotential: '₹5–10 lakh',
        potentialSalesChannels: ['Walk-in customers'],
        operationalCapacity: 'Moderate',
      },
      coordinator
    );

    // 3. Admin reassigns
    await repository.reassignRetailer(ret.id, 'user_coord_2', admin);

    // Retrieve audit logs as admin
    const logs = await repository.getAuditLogs(admin);
    expect(logs.length).toBeGreaterThanOrEqual(3);

    const eventTypes = logs.map((l) => l.event_type);
    expect(eventTypes).toContain('RETAILER_CREATED');
    expect(eventTypes).toContain('QUALIFICATION_COMPLETED');
    expect(eventTypes).toContain('ASSIGNMENT_CHANGED');

    // Verify sanitized metadata
    for (const log of logs) {
      if (log.metadata) {
        expect(log.metadata).not.toHaveProperty('password');
        expect(log.metadata).not.toHaveProperty('aadhaar');
      }
    }
  });
});
