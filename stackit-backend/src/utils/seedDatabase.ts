import mongoose from 'mongoose';
import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { connectDatabase } from './database';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('🗑️  Clearing existing questions...');
    await Question.deleteMany({});
    await Answer.deleteMany({});
    
    // Create demo users if they don't exist
    console.log('👥 Creating demo users...');
    
    let demoUser = await User.findOne({ email: 'user@demo.com' });
    if (!demoUser) {
      demoUser = new User({
        username: 'demo_user',
        email: 'user@demo.com',
        password: 'password123',
        role: 'user',
        reputation: 150
      });
      await demoUser.save();
    }

    let demoAdmin = await User.findOne({ email: 'admin@demo.com' });
    if (!demoAdmin) {
      demoAdmin = new User({
        username: 'demo_admin',
        email: 'admin@demo.com',
        password: 'password123',
        role: 'admin',
        reputation: 500
      });
      await demoAdmin.save();
    }

    // Create additional users for variety
    const additionalUsers = [];
    for (let i = 1; i <= 3; i++) {
      let user = await User.findOne({ email: `user${i}@example.com` });
      if (!user) {
        user = new User({
          username: `developer${i}`,
          email: `user${i}@example.com`,
          password: 'password123',
          role: 'user',
          reputation: Math.floor(Math.random() * 300) + 50
        });
        await user.save();
      }
      additionalUsers.push(user);
    }

    const allUsers = [demoUser, demoAdmin, ...additionalUsers];
    
    console.log('❓ Creating sample questions...');
    
    // Sample questions with proper ObjectId references
    const sampleQuestions = [
      {
        title: "How to use React hooks with TypeScript?",
        description: `<p>I'm having trouble understanding how to properly type React hooks in TypeScript. Specifically, I'm confused about:</p>
        <ul>
          <li>useState with complex objects</li>
          <li>useEffect dependencies</li>
          <li>Custom hooks with proper typing</li>
        </ul>
        <p>Can someone provide examples and best practices?</p>`,
        tags: ["react", "typescript", "hooks", "javascript"],
        author: allUsers[0]._id,
        votes: 15,
        views: 234,
        isActive: true
      },
      {
        title: "MongoDB aggregation pipeline performance optimization",
        description: `<p>I have a complex aggregation pipeline that's running very slowly on large datasets:</p>
        <pre><code>db.collection.aggregate([
  { $match: { status: 'active' } },
  { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  { $group: { _id: '$category', count: { $sum: 1 } } }
])</code></pre>
        <p>The collection has over 1 million documents. What are the best practices for optimizing this?</p>`,
        tags: ["mongodb", "aggregation", "performance", "database"],
        author: allUsers[1]._id,
        votes: 8,
        views: 156,
        isActive: true
      },
      {
        title: "JWT token authentication best practices in Node.js",
        description: `<p>I'm implementing JWT authentication in my Node.js/Express application and I want to make sure I'm following security best practices.</p>
        <p><strong>My current implementation:</strong></p>
        <ul>
          <li>Storing JWT in localStorage</li>
          <li>No token refresh mechanism</li>
          <li>Tokens expire after 24 hours</li>
        </ul>
        <p>What security vulnerabilities should I be aware of? Should I implement refresh tokens?</p>`,
        tags: ["nodejs", "jwt", "authentication", "security", "express"],
        author: allUsers[2]._id,
        votes: 23,
        views: 445,
        isActive: true
      },
      {
        title: "Docker containerization for MERN stack application",
        description: `<p>I'm trying to containerize my MERN stack application but running into issues with:</p>
        <ol>
          <li>Container networking between services</li>
          <li>Environment variables management</li>
          <li>Database persistence with Docker volumes</li>
        </ol>
        <p>Here's my current docker-compose.yml structure, but the frontend can't connect to the backend:</p>
        <pre><code>version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
  backend:
    build: ./backend
    ports:
      - '5000:5000'
  mongodb:
    image: mongo:latest
    ports:
      - '27017:27017'</code></pre>`,
        tags: ["docker", "mern", "containerization", "devops"],
        author: allUsers[3]._id,
        votes: 12,
        views: 98,
        isActive: true
      },
      {
        title: "Optimizing React component re-renders with useMemo and useCallback",
        description: `<p>My React application is experiencing performance issues due to unnecessary re-renders. I've heard about <code>useMemo</code> and <code>useCallback</code> but I'm not sure when and how to use them effectively.</p>
        <p><strong>Specific questions:</strong></p>
        <ul>
          <li>When should I use useMemo vs useCallback?</li>
          <li>How do I identify components that are re-rendering unnecessarily?</li>
          <li>Are there any tools to debug performance issues?</li>
        </ul>
        <p>Example component that might be causing issues:</p>
        <pre><code>const ExpensiveComponent = ({ data, onUpdate }) => {
  const processedData = data.map(item => ({ ...item, processed: true }));
  
  return (
    &lt;div&gt;
      {processedData.map(item => 
        &lt;Item key={item.id} data={item} onClick={() => onUpdate(item)} /&gt;
      )}
    &lt;/div&gt;
  );
};</code></pre>`,
        tags: ["react", "performance", "optimization", "hooks"],
        author: allUsers[4]._id,
        votes: 19,
        views: 287,
        isActive: true
      },
      {
        title: "Implementing real-time chat with Socket.io and React",
        description: `<p>I'm building a real-time chat application using Socket.io for the backend and React for the frontend. I need help with:</p>
        <p><strong>Backend (Socket.io):</strong></p>
        <ul>
          <li>Room management for different chat channels</li>
          <li>User authentication with JWT tokens</li>
          <li>Message persistence to MongoDB</li>
        </ul>
        <p><strong>Frontend (React):</strong></p>
        <ul>
          <li>Managing socket connections in React components</li>
          <li>Handling disconnections and reconnections</li>
          <li>Real-time message updates without re-rendering entire chat</li>
        </ul>
        <p>Any recommendations for scalable architecture patterns?</p>`,
        tags: ["socketio", "react", "realtime", "chat", "websockets"],
        author: allUsers[0]._id,
        votes: 31,
        views: 512,
        isActive: true
      },
      {
        title: "TypeScript generic constraints and conditional types",
        description: `<p>I'm trying to create a type-safe API client in TypeScript and struggling with generic constraints. Here's what I'm trying to achieve:</p>
        <pre><code>interface ApiResponse&lt;T&gt; {
  data: T;
  status: number;
  message: string;
}

// I want this to work:
const response = await apiClient.get&lt;User&gt;('/users/123');
// response.data should be type User</code></pre>
        <p>How can I properly implement conditional types and generic constraints for this use case?</p>`,
        tags: ["typescript", "generics", "types", "api"],
        author: allUsers[2]._id,
        votes: 7,
        views: 89,
        isActive: true
      },
      {
        title: "CSS Grid vs Flexbox: When to use which?",
        description: `<p>I'm often confused about when to use CSS Grid versus Flexbox for layout. Both seem to solve similar problems but I know they have different strengths.</p>
        <p><strong>My questions:</strong></p>
        <ul>
          <li>What are the key differences between Grid and Flexbox?</li>
          <li>When should I choose one over the other?</li>
          <li>Can they be used together effectively?</li>
          <li>Are there performance considerations?</li>
        </ul>
        <p>I'd love to see some practical examples!</p>`,
        tags: ["css", "grid", "flexbox", "layout", "frontend"],
        author: allUsers[3]._id,
        votes: 14,
        views: 203,
        isActive: true
      }
    ];

    // Insert questions
    const createdQuestions = [];
    for (const questionData of sampleQuestions) {
      const question = new Question(questionData);
      await question.save();
      createdQuestions.push(question);
    }

    console.log('💬 Creating sample answers...');
    
    // Create some sample answers
    const sampleAnswers = [
      {
        content: `<p>Great question! Here's how to properly type React hooks in TypeScript:</p>
        <h3>useState with complex objects:</h3>
        <pre><code>interface User {
  id: number;
  name: string;
  email: string;
}

const [user, setUser] = useState&lt;User | null&gt;(null);</code></pre>
        <p>This approach ensures type safety while allowing for null initial state.</p>`,
        author: allUsers[1]._id,
        question: createdQuestions[0]._id,
        votes: 12,
        isAccepted: true
      },
      {
        content: `<p>For MongoDB aggregation performance, here are key optimizations:</p>
        <ol>
          <li><strong>Use indexes:</strong> Make sure you have indexes on fields used in $match</li>
          <li><strong>$match early:</strong> Put $match as early as possible in the pipeline</li>
          <li><strong>$project to reduce data:</strong> Only include fields you need</li>
        </ol>
        <pre><code>db.collection.aggregate([
  { $match: { status: 'active' } }, // Use index here
  { $project: { userId: 1, category: 1 } }, // Reduce data early
  { $lookup: { ... } }
])</code></pre>`,
        author: allUsers[0]._id,
        question: createdQuestions[1]._id,
        votes: 8,
        isAccepted: true
      }
    ];

    for (const answerData of sampleAnswers) {
      const answer = new Answer(answerData);
      await answer.save();
      
      // Add answer to question's answers array
      await Question.findByIdAndUpdate(
        answerData.question,
        { 
          $push: { answers: answer._id },
          $set: { acceptedAnswer: answerData.isAccepted ? answer._id : undefined }
        }
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Created ${createdQuestions.length} questions and ${sampleAnswers.length} answers`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();