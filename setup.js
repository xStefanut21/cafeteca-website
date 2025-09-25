const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create necessary directories
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
}

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Create initial menu data if it doesn't exist
const menuFile = path.join(dataDir, 'menu.json');
if (!fs.existsSync(menuFile)) {
    const initialMenu = {
        items: [
            {
                id: uuidv4(),
                name: 'Cappuccino',
                category: 'coffee',
                price: 4.50,
                description: 'Rich espresso with steamed milk and a silky foam',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0006.jpg'
            },
            {
                id: uuidv4(),
                name: 'Iced Coffee',
                category: 'coffee',
                price: 4.25,
                description: 'Chilled coffee with milk and ice, perfect for hot days',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0007.jpg'
            },
            {
                id: uuidv4(),
                name: 'Croissant',
                category: 'pastries',
                price: 3.25,
                description: 'Buttery, flaky pastry with a perfect golden crust',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0008.jpg'
            },
            {
                id: uuidv4(),
                name: 'Avocado Toast',
                category: 'food',
                price: 8.99,
                description: 'Sourdough bread with smashed avocado, cherry tomatoes, and feta',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0009.jpg'
            },
            {
                id: uuidv4(),
                name: 'Fresh Salad',
                category: 'food',
                price: 9.50,
                description: 'Mixed greens with seasonal vegetables and house dressing',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0010.jpg'
            },
            {
                id: uuidv4(),
                name: 'Chocolate Cake',
                category: 'desserts',
                price: 5.99,
                description: 'Decadent chocolate cake with rich ganache',
                status: 'available',
                imageUrl: '/images/IMG-20250830-WA0011.jpg'
            }
        ]
    };
    
    fs.writeFileSync(menuFile, JSON.stringify(initialMenu, null, 2));
    console.log('Created initial menu data');
}

// Create initial events data if it doesn't exist
const eventsFile = path.join(dataDir, 'events.json');
if (!fs.existsSync(eventsFile)) {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const initialEvents = [
        {
            id: uuidv4(),
            title: 'Live Jazz Night',
            description: 'Join us for an evening of smooth jazz with local artists',
            date: nextWeek.toISOString().split('T')[0],
            startTime: '19:00',
            endTime: '22:00',
            status: 'active',
            imageUrl: '/images/event-placeholder.jpg'
        },
        {
            id: uuidv4(),
            title: 'Latte Art Workshop',
            description: 'Learn the art of latte making and decorating',
            date: new Date(nextWeek.setDate(nextWeek.getDate() + 3)).toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '16:00',
            status: 'active',
            imageUrl: '/images/workshop-placeholder.jpg'
        }
    ];
    
    fs.writeFileSync(eventsFile, JSON.stringify(initialEvents, null, 2));
    console.log('Created initial events data');
}

// Create a README file with setup instructions
const readmePath = path.join(__dirname, 'ADMIN-README.md');
if (!fs.existsSync(readmePath)) {
    const readmeContent = `# Cafeteca Admin Setup

## Initial Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Update the admin credentials and other settings as needed

3. Run the setup script to create initial data:
   \`\`\`bash
   npm run setup
   \`\`\`

## Available Scripts

- \`npm start\` - Start the production server
- \`npm run dev\` - Start the development server with nodemon
- \`npm run setup\` - Run the initial setup (creates data files and directories)
- \`npm run generate-password-hash <password>\` - Generate a bcrypt hash for the admin password

## Default Admin Credentials

- **Username:** admin
- **Password:** (set in .env file)

## File Structure

- \`/public\` - Static files (HTML, CSS, JS, images)
- \`/data\` - JSON data files (automatically created)
- \`/public/uploads\` - Uploaded images
- \`server.js\` - Main server file
- \`.env\` - Environment variables (create from .env.example)

## Security Notes

- Always use a strong password for the admin account
- Keep your \`.env\` file secure and never commit it to version control
- The default session secret should be changed in production
`;

    fs.writeFileSync(readmePath, readmeContent);
    console.log('Created ADMIN-README.md');
}

console.log('Setup completed successfully!');
