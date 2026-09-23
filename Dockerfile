# Dockerfile is used to create a blueprint of a single image, which is an application package
# So inside Dockerfile it requires the OS used, source code files, dependencies, user, commands available

# Build Stage
# Get Alpine Linux OS, download nodejs 24 runtime environment with npm and name the stage as builder
FROM node:24-alpine AS builder 

# mkdir /app cd /app
WORKDIR /app

# copy package.json file into the created /app dir
COPY package*.json ./

# tell docker to run npm first before copy source code so that it can reuse npm cache instead of doing npm run every time
# npm ci means similar to npm install but ci means strictly follow what package-lock.json stated
RUN npm ci

# copy whole project folder into the docker working dir (/app), excluding files/folders listed in dockerignore
COPY . . 

# execute nest build from package.json scripts
RUN npm run build


# Test Stage
# Start test stage from completed builder stage
FROM builder AS test

# define node environment to be test, meaning use testing database etc
ENV NODE_ENV=test

# provide it command to run the test from package.json
CMD ["npm", "test"]

# Runtime Stage
# Start everything from scratch instead of containing all the test & test output junks which bloats the image size
FROM node:24-alpine AS runtime

# Similar process as build
WORKDIR /app

# State node environment to be production instead of testing
ENV NODE_ENV=production

# Similar process as above
COPY package*.json ./

# npm ci install everything from package-lock.json, --omit=dev means skip dev-dependencies from package-lock.json like typescript runtime & tests, delete npm download cache
RUN npm ci --omit=dev && npm cache clean --force

# copy what the files have on builder stage, take builder:/app/dist and put it into ./dist, set owner to be user node & group node
COPY --from=builder --chown=node:node /app/dist ./dist

# Set user as node so everything runs with node privillege instead of root privs. Least Privellege principles
USER node

# Listen to any data from port 3000
EXPOSE 3000

# Since nest build is done from builder stage, node dist/main.js help start nestjs with compiled js from build with ts
CMD ["node", "dist/main.js"]