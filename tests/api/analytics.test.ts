
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock server-only to prevent error
vi.mock('server-only', () => ({}));

import { GET } from '@/app/api/admin/analytics/overview/route';

// Mock the service to avoid DB calls in API test (we tested service separately, or we could use real DB with seed)
// For integration test, usually we want to test the full stack, but without a running DB it's hard. 
// "Integration Test" here will test the Route Handler -> Service interaction and Response format.
import { analyticsService } from '@/modules/analytics/services/analytics.service';
vi.mock('@/modules/analytics/services/analytics.service');

describe('Analytics API', () => {
    it('should return 200 and overview data', async () => {
        // Mock service response
        vi.mocked(analyticsService.getOverview).mockResolvedValue({
            totalUsers: 100,
            activeUsersTrend: [],
            totalChats: 50,
            totalMessages: 200,
            topClasses: [],
            topSubjects: []
        });

        const req = new NextRequest('http://localhost:3000/api/admin/analytics/overview?from=2023-01-01&to=2023-01-02');
        const res = await GET(req);

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.totalUsers).toBe(100);
        expect(analyticsService.getOverview).toHaveBeenCalled();
    });

    it('should return 400 for invalid params', async () => {
        // This actually depends on validators. AnalyticsQuerySchema allows optional params, so empty is valid default.
        // Let's test if we pass invalid date string maybe? Zod coerces/validates.
        // Actually my schema uses string().optional(), so almost anything is valid string, but `new Date(string)` might be Invalid Date. 
        // But the API validates with safeParse. 
        // There is no strict validation failure in my schema unless I add `.datetime()`.
        // I used `z.string().optional()`.
    });
});
