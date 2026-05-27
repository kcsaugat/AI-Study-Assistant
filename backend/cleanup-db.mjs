import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanUp() {
  try {
    // Delete all quizzes that have mock questions
    const allQuizzes = await prisma.quiz.findMany({
      include: { questions: true }
    });
    const mockQuizzes = allQuizzes.filter(q => 
      q.questions.some(qn => qn.explanation?.includes("mock") || qn.explanation?.includes("Mock"))
    );

    console.log(`Found ${mockQuizzes.length} mock quizzes.`);

    for (const q of mockQuizzes) {
      await prisma.quiz.delete({ where: { id: q.id } });
      console.log(`Deleted mock quiz: ${q.id}`);
    }
    
    const allDecks = await prisma.flashcardDeck.findMany({
      include: { flashcards: true }
    });
    const mockDecks = allDecks.filter(d => 
      d.flashcards.some(c => c.back?.includes("mock") || c.back?.includes("Mock") || c.back?.includes("unavailable"))
    );
    for (const d of mockDecks) {
      await prisma.flashcardDeck.delete({ where: { id: d.id } });
      console.log(`Deleted mock deck: ${d.id}`);
    }
    
    await prisma.summary.deleteMany({
      where: { content: { contains: "Key concept: Understanding the core principles" } }
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUp();
