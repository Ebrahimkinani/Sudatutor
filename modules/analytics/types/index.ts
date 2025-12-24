
export interface DateRange {
    from: Date;
    to: Date;
}

export interface AnalyticsFilter extends DateRange {
    classId?: string;
    subjectId?: string;
}

export interface DayStats {
    date: string; // ISO date string
    value: number;
}

export interface AnalyticsOverviewDTO {
    totalUsers: number;
    activeUsersTrend: DayStats[];
    totalChats: number;
    totalMessages: number;
    topClasses: { name: string; activity: number }[];
    topSubjects: { name: string; activity: number }[];
}

export interface ClassAnalyticsDTO {
    classId: string;
    className: string;
    activeStudents: number;
    totalChats: number;
    totalMessages: number;
    dailyActivity: DayStats[];
}

export interface SubjectAnalyticsDTO {
    subjectId: string;
    subjectName: string;
    activeStudents: number;
    totalChats: number;
    totalMessages: number;
    dailyActivity: DayStats[];
}

export interface ChatAnalyticsDTO {
    date: string;
    count: number;
}

export interface DailyUserStats {
    id: string;
    date: Date;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
}

export interface DailyClassStats {
    id: string;
    date: Date;
    classId: string;
    activeStudents: number;
    chats: number;
    messages: number;
}

export interface DailySubjectStats {
    id: string;
    date: Date;
    subjectId: string;
    activeStudents: number;
    chats: number;
    messages: number;
}
