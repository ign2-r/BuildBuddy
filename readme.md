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