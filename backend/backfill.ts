import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  const notes = await prisma.note.findMany();
  for (const n of notes) {
    const exists = await prisma.activityLog.findFirst({ where: { userId: n.userId, action: 'NOTE_CREATED', createdAt: n.createdAt } });
    if (!exists) {
      await prisma.activityLog.create({ data: { userId: n.userId, action: 'NOTE_CREATED', createdAt: n.createdAt } });
    }
  }

  const summaries = await prisma.summary.findMany({ include: { note: true } });
  for (const s of summaries) {
    if (s.note) {
      const exists = await prisma.activityLog.findFirst({ where: { userId: s.note.userId, action: 'SUMMARY_GENERATED', createdAt: s.createdAt } });
      if (!exists) {
        await prisma.activityLog.create({ data: { userId: s.note.userId, action: 'SUMMARY_GENERATED', createdAt: s.createdAt } });
      }
    }
  }

  const quizzes = await prisma.quiz.findMany({ include: { note: true } });
  for (const q of quizzes) {
    if (q.note) {
      const exists = await prisma.activityLog.findFirst({ where: { userId: q.note.userId, action: 'QUIZ_TAKEN', createdAt: q.createdAt } });
      if (!exists) {
        await prisma.activityLog.create({ data: { userId: q.note.userId, action: 'QUIZ_TAKEN', createdAt: q.createdAt } });
      }
    }
  }

  const decks = await prisma.flashcardDeck.findMany({ include: { note: true } });
  for (const d of decks) {
    if (d.note) {
      const exists = await prisma.activityLog.findFirst({ where: { userId: d.note.userId, action: 'FLASHCARD_GENERATED', createdAt: d.createdAt } });
      if (!exists) {
        await prisma.activityLog.create({ data: { userId: d.note.userId, action: 'FLASHCARD_GENERATED', createdAt: d.createdAt } });
      }
    }
  }
  console.log("Backfill complete");
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
