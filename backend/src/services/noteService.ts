import { prisma } from '../config/database';

export async function createNote(userId: string, title: string, content: string, fileUrl?: string) {
  const note = await prisma.note.create({
    data: { userId, title, content, fileUrl },
  });
  
  await prisma.activityLog.create({
    data: { userId, action: 'NOTE_CREATED' }
  });
  
  return note;
}

export async function getUserNotes(userId: string) {
  return prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      summary: { select: { id: true, createdAt: true } },
      _count: { select: { quizzes: true, flashcardDecks: true } },
    },
  });
}

export async function getNoteById(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, userId } });
  if (!note) throw Object.assign(new Error('Note not found'), { statusCode: 404 });
  return note;
}

export async function updateNote(id: string, userId: string, title: string, content: string) {
  await getNoteById(id, userId); // ownership check
  return prisma.note.update({ where: { id }, data: { title, content } });
}

export async function deleteNote(id: string, userId: string) {
  await getNoteById(id, userId); // ownership check
  return prisma.note.delete({ where: { id } });
}

export async function getDashboardStats(userId: string) {
  // Fetch user to get reset timestamps
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streakResetAt: true,
      weeklyGoalsResetAt: true,
      brainSyncResetAt: true,
      focusAnalyticsResetAt: true,
    }
  });

  const streakResetAt = user?.streakResetAt || new Date(0);
  const weeklyGoalsResetAt = user?.weeklyGoalsResetAt || new Date(0);
  const brainSyncResetAt = user?.brainSyncResetAt || new Date(0);
  const focusAnalyticsResetAt = user?.focusAnalyticsResetAt || new Date(0);

  // Lifetime counts don't use reset timestamps
  const [noteCount, summaryCount, quizCount, flashcardDeckCount, chatCount] = await Promise.all([
    prisma.activityLog.count({ where: { userId, action: 'NOTE_CREATED' } }),
    prisma.activityLog.count({ where: { userId, action: 'SUMMARY_GENERATED' } }),
    prisma.activityLog.count({ where: { userId, action: 'QUIZ_TAKEN' } }),
    prisma.activityLog.count({ where: { userId, action: 'FLASHCARD_GENERATED' } }),
    prisma.chatSession.count({ where: { userId } }),
  ]);

  const recentNotes = await prisma.note.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // For weekly goals, we also need to respect weeklyGoalsResetAt
  const goalsStartDate = sevenDaysAgo > weeklyGoalsResetAt ? sevenDaysAgo : weeklyGoalsResetAt;

  const [weeklyNoteCount, weeklyQuizCount] = await Promise.all([
    prisma.activityLog.count({ where: { userId, action: 'NOTE_CREATED', createdAt: { gte: goalsStartDate } } }),
    prisma.activityLog.count({ where: { userId, action: 'QUIZ_TAKEN', createdAt: { gte: goalsStartDate } } }),
  ]);

  // Calculate streak based on ActivityLog after streakResetAt
  const allLogsForStreak = await prisma.activityLog.findMany({
    where: { userId, createdAt: { gt: streakResetAt } },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' }
  });

  let studyStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const uniqueDates = Array.from(new Set(allLogsForStreak.map(n => {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })));

  for (const time of uniqueDates) {
    if (time === currentDate.getTime()) {
      studyStreak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (time === currentDate.getTime() - 86400000 && studyStreak === 0) {
      // If they haven't studied today but studied yesterday, the streak is still alive
      studyStreak++;
      currentDate = new Date(time);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate 14-day activity array for the graph
  const activityByDay = [];
  const todayForActivity = new Date();
  todayForActivity.setHours(0, 0, 0, 0);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(todayForActivity);
    d.setDate(d.getDate() - i);
    const count = allLogsForStreak.filter(n => {
      const nd = new Date(n.createdAt);
      nd.setHours(0, 0, 0, 0);
      return nd.getTime() === d.getTime();
    }).length;
    
    activityByDay.push({
      date: d.toISOString().split('T')[0],
      count
    });
  }

  // Calculate brain sync (quizzes / notes)
  // Need to respect brainSyncResetAt
  const [syncNotes, syncQuizzes] = await Promise.all([
    prisma.activityLog.count({ where: { userId, action: 'NOTE_CREATED', createdAt: { gt: brainSyncResetAt } } }),
    prisma.activityLog.count({ where: { userId, action: 'QUIZ_TAKEN', createdAt: { gt: brainSyncResetAt } } })
  ]);
  
  // Calculate focus analytics
  // Need to respect focusAnalyticsResetAt
  const [focusQuizzes, focusSummaries, focusFlashcards] = await Promise.all([
    prisma.activityLog.count({ where: { userId, action: 'QUIZ_TAKEN', createdAt: { gt: focusAnalyticsResetAt } } }),
    prisma.activityLog.count({ where: { userId, action: 'SUMMARY_GENERATED', createdAt: { gt: focusAnalyticsResetAt } } }),
    prisma.activityLog.count({ where: { userId, action: 'FLASHCARD_GENERATED', createdAt: { gt: focusAnalyticsResetAt } } })
  ]);

  return { 
    noteCount, summaryCount, quizCount, flashcardDeckCount, chatCount, recentNotes,
    weeklyNoteCount, weeklyQuizCount, studyStreak, activityByDay,
    syncNotes, syncQuizzes, focusQuizzes, focusSummaries, focusFlashcards
  };
}

export async function resetDashboardData(userId: string, type?: string) {
  const updateData: any = {};
  const now = new Date();

  if (type === 'streak') updateData.streakResetAt = now;
  else if (type === 'goals') updateData.weeklyGoalsResetAt = now;
  else if (type === 'sync') updateData.brainSyncResetAt = now;
  else if (type === 'analytics') updateData.focusAnalyticsResetAt = now;
  else {
    // fallback if no type provided, reset all
    updateData.streakResetAt = now;
    updateData.weeklyGoalsResetAt = now;
    updateData.brainSyncResetAt = now;
    updateData.focusAnalyticsResetAt = now;
  }

  // @ts-ignore - Ignore type error if prisma client is not generated yet
  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });
  
  return { success: true };
}
