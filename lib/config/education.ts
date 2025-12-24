export const CLASSES = [
    "الصف 1",
    "الصف 2",
    "الصف 3",
    "الصف 4",
    "الصف 5",
    "الصف 6",
    "الصف 7",
    "الصف 8",
    "الصف 9",
    "الصف 10",
    "الصف 11",
    "الصف 12",
    "الجامعة",
] as const;

export const SUBJECTS = [
    "الرياضيات",
    "الفيزياء",
    "الكيمياء",
    "الأحياء",
    "الإنجليزية",
    "العربية",
    "التاريخ",
    "الجغرافيا",
    "علوم الحاسوب",
    "الدراسات الإسلامية",
] as const;

export type ClassName = (typeof CLASSES)[number];
export type SubjectName = (typeof SUBJECTS)[number];
