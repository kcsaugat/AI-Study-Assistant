import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No user found! Please sign up first.');
    return;
  }
  
  console.log(`Seeding data for user: ${user.name} (${user.email})`);

  // Create Notes
  const note1 = await prisma.note.create({
    data: {
      title: 'Biology 101: Cellular Respiration',
      content: 'Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products.',
      userId: user.id,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    }
  });

  const note2 = await prisma.note.create({
    data: {
      title: 'History: The Renaissance',
      content: 'The Renaissance was a fervent period of European cultural, artistic, political and economic "rebirth" following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature and art.',
      userId: user.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  });

  // Create Summary for Note 1
  await prisma.summary.create({
    data: {
      content: 'Cellular respiration is the process by which biological fuels are oxidized in the presence of an inorganic electron acceptor, such as oxygen, to produce large amounts of energy, to drive the bulk production of ATP.',
      noteId: note1.id,
    }
  });

  // Create Quiz for Note 1
  const quiz1 = await prisma.quiz.create({
    data: {
      title: 'Cellular Respiration Quick Quiz',
      noteId: note1.id,
      questions: {
        create: [
          {
            questionText: 'What is the main product of cellular respiration?',
            options: JSON.stringify(['Oxygen', 'Glucose', 'ATP', 'Carbon Dioxide']),
            correctAnswer: 2,
            explanation: 'ATP is the energy currency of the cell produced during cellular respiration.'
          },
          {
            questionText: 'Where does cellular respiration occur?',
            options: JSON.stringify(['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus']),
            correctAnswer: 1,
            explanation: 'The mitochondria is known as the powerhouse of the cell, where most cellular respiration takes place.'
          }
        ]
      }
    }
  });

  // Create Flashcard Deck for Note 2
  const deck1 = await prisma.flashcardDeck.create({
    data: {
      title: 'Renaissance Key Terms',
      noteId: note2.id,
      flashcards: {
        create: [
          { front: 'When did the Renaissance take place?', back: '14th to 17th century' },
          { front: 'What did the Renaissance promote?', back: 'Rediscovery of classical philosophy, literature and art' }
        ]
      }
    }
  });

  // Create a Chat Session for Note 1
  const chat1 = await prisma.chatSession.create({
    data: {
      title: 'Discussion on ATP',
      noteId: note1.id,
      userId: user.id,
      messages: {
        create: [
          { role: 'user', content: 'What exactly is ATP?' },
          { role: 'assistant', content: 'ATP stands for Adenosine Triphosphate. Think of it as the energy currency of the cell that provides the power for almost all cellular activities.' }
        ]
      }
    }
  });

  // Create a general Chat Session without a note
  const chat2 = await prisma.chatSession.create({
    data: {
      title: 'Study planning for finals',
      userId: user.id,
      messages: {
        create: [
          { role: 'user', content: 'Can you help me create a study schedule for my biology and history finals next week?' },
          { role: 'assistant', content: 'Absolutely! To get started, how many hours a day can you dedicate to studying?' }
        ]
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
