# Step 1: Use a Node.js base image for building the React app
FROM node:20 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Use a lightweight web server to serve the built app
FROM nginx:1.25-alpine

# Copy the built React app from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose the default port Nginx uses
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]