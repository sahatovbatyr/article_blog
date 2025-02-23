FROM node:23.5-slim

ENV APP__HOME_DIR=/my_backend_app

# Set the working directory inside the container
WORKDIR $APP__HOME_DIR

# set work directory
RUN mkdir -p $APP__HOME_DIR
RUN mkdir -p $APP__HOME_DIR/logs
RUN mkdir -p $APP__HOME_DIR/src
# RUN mkdir -p $APP__HOME_DIR/docker/backend
RUN mkdir -p $APP__HOME_DIR/src/media/attachments/

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

COPY ./dist ./dist

# Build the NestJS application
RUN npm run build

# Устанавливаем переменную окружения для запуска сервера
#ENV NODE_ENV=production

# Expose the application port
EXPOSE 7000

# Command to run the application
#CMD ["npm", "run", "start:prod"]
#CMD ["node", "dist/main"]
CMD ["npm", "run", "start:dev"]