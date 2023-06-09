FROM node:14.21.2 as production
 
# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# Set the environment variable
ENV NODE_ENV=production

#RUN npx expo export:web

RUN yarn build

### STAGE 2:RUN ###
# Defining nginx image to be used
FROM nginx:latest AS ngi
# Copying compiled code and nginx config to different folder
# NOTE: This path may change according to your project's output folder 
COPY --from=production /usr/src/app/web-build /usr/share/nginx/html
COPY nginx.conf  /etc/nginx/conf.d/default.conf
# Exposing a port, here it means that inside the container 
# the app will be using Port 80 while running
EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]

# when pushing to beamoph.cloud, one must tag first
# docker tag docufy-app:latest  hub1.beamoph.cloud/docufy/docufy-app:latest
# docker push hub1.beamoph.cloud/docufy/docufy-app:latest