# Cafeteca Admin Setup

## Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the admin credentials and other settings as needed

3. Run the setup script to create initial data:
   ```bash
   npm run setup
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run setup` - Run the initial setup (creates data files and directories)
- `npm run generate-password-hash <password>` - Generate a bcrypt hash for the admin password

## Default Admin Credentials

- **Username:** admin
- **Password:** (set in .env file)

## File Structure

- `/public` - Static files (HTML, CSS, JS, images)
- `/data` - JSON data files (automatically created)
- `/public/uploads` - Uploaded images
- `server.js` - Main server file
- `.env` - Environment variables (create from .env.example)

## Security Notes

- Always use a strong password for the admin account
- Keep your `.env` file secure and never commit it to version control
- The default session secret should be changed in production
