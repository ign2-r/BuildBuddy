# Tech Stack

| Technology             | Implementation         |
|------------------------|------------------------|
| Frontend               | NextJS, MaterialUI, AuthJS|
| Backend                | Node.js/Express.js |
| Database               | MongoDB |
| Deployment             | Docker |

## Starting the App
### General Steps
- Refer to backend and frontend `.env.example` to make `.env` for backend and `.env.local` for frontend

### Developmental Set up
#### Docker Set Up 
- Sets up the database, core, and website in production mode
- It will set the database to the docker mongodb in the core and web set ups
- Note, a volume will be set up for the database, however, it will start without any information so run `{{env.domain}}/test/addRandomProducts` POST request if you have `final-temp.json` in backend/src/routes

`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d`
#### Docker Tear Down 
`docker-compose -f docker-compose.yml -f docker-compose.dev.yml down`

### Deployment Set up
#### Docker Set Up 
- Uses whatever is in .env for mongodb 

`docker-compose up -d`
#### Docker Tear Down 
`docker-compose down`

### Server set up
1. Update 
   1. sudo apt update
2. install 
   1. nginx -- sudo apt install nginx
   2. [docker](https://docs.docker.com/engine/install/ubuntu/) 
   3. pm2 (for continious hosting of the frontend)- `npm install pm2 -g`
3. Start frontend service
   1. Within the frontend folder
   2. install all pacakages pnpm i
   3. build first via pnpm build
   4. pm2 start pnpm --name buildbuddy-fe -- start --port 3000
4. Start frontend service
   1. Within the frontend folder
   2. install all pacakages pnpm i
   3. pm2 start pnpm --name buildbuddy-be -- start --port 5000
5. Enable Firewall
   1. sudo ufw allow 'OpenSSH'
   2. sudo ufw allow 'Nginx Full'
6. set up certs for 443
   1. https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-20-04
   2. sudo apt install certbot python3-certbot-nginx
7. 
8. [Set up Nginx](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-20-04#step-5-%E2%80%93-setting-up-server-blocks-(recommended))
   1. sudo nano /etc/nginx/sites-available/your_domain
   2. sudo ln -s /etc/nginx/sites-available/your_domain /etc/nginx/sites-enabled/