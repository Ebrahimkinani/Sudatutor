
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from './analytics.service';
import { analyticsRepository } from '../repositories/analytics.repository';

// Mock the repository
vi.mock('../repositories/analytics.repository', () => ({
    analyticsRepository: {
        getDailyUserStats: vi.fn(),
        getTotalUsers: vi.fn(),
        getDailyClassStats: vi.fn(),
        getDailySubjectStats: vi.fn(),
    },
}));

describe('AnalyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should aggregate overview data correctly', async () => {
        // Setup mocks
        vi.mocked(analyticsRepository.getTotalUsers).mockResolvedValue(100);
        vi.mocked(analyticsRepository.getDailyUserStats).mockResolvedValue([
            { date: new Date('2023-01-01'), activeUsers: 10, totalUsers: 50, newUsers: 5, id: '1' },
            { date: new Date('2023-01-02'), activeUsers: 20, totalUsers: 55, newUsers: 5, id: '2' },
        ]);
        vi.mocked(analyticsRepository.getDailyClassStats).mockResolvedValue([
            { date: new Date('2023-01-01'), classId: 'C1', chats: 5, messages: 10, activeStudents: 5, id: '1' },
        ]);
        vi.mocked(analyticsRepository.getDailySubjectStats).mockResolvedValue([]);

        const result = await analyticsService.getOverview({ from: new Date('2023-01-01'), to: new Date('2023-01-02') });

        expect(result.totalUsers).toBe(100);
        expect(result.activeUsersTrend).toHaveLength(2);
        expect(result.totalChats).toBe(5);
        expect(result.totalMessages).toBe(10);
    });
});
