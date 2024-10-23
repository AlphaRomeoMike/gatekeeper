# Trippy | A Microservices Platform for Ride Hailing

## Requirements
- Docker
- Node Version 20 or above 
- Any instance of RDBMS (MySQL/PGSQL/MSSQL) or Document DBMS (MongoDB) etc 🪴
- PNPM package manager, `npm` or `yarn` will work however PNPM has the best performance 🌪

## Setup
- Run command `cp .env.example .env`
- Fill in the defined variables in the newly created file
- Set the target to `production` in `docker-compose.yml`
- If you are running locally, you can run `docker compose up -d`
- You are good to go 🚀 

## Migrations
- Run command `npm typeorm -- migration:gen`

