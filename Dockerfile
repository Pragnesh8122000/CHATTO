# Use the official Node.js image as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Run migrations only after PostgreSQL is ready
CMD [ "node", "app.js" ]