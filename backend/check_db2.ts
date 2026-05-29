import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quizzes = await prisma.quiz.findMany({ select: { id: true, title: true, note: { select: { userId: true } } } });
  console.log('Quizzes:', JSON.stringify(quizzes, null, 2));
  const flashcards = await prisma.flashcardDeck.findMany({ select: { id: true, title: true, note: { select: { userId: true } } } });
  console.log('Flashcards:', JSON.stringify(flashcards, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
