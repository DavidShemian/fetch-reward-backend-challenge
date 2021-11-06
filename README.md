## Description

Fetch Reward Home Challenge implementation by David Shemian. </br>
This is not production-ready product, but I did tried to make it an easy shift to production, if needed.</br>
I used NestJS, which, IMO is a great server-side Node.js Typescript framework, that has some great tools for production usage.</br>
My project is modeled by the Layer system, i.e. there are controllers, to handel the incoming requests, services to handel the business logic and DAL (Data Access Layer) which handles the DB access.</br>
For this project, I'm using sqlite3 as a simple-in memory SQL DB. </br>
In case this project was to go to production, some of the things that I would think about doing are:

-   Use an environment configuration system, instead of hard coding the configurations as it is right now.
-   Use a production-suited, well indexed DB such as PostgreSQL or MySQL, or MongoDB if NoSQL is preferred (Which is a choice by itself, that depends on many things).
-   Added some more unit tests to the already existing e2e tests
-   Add some CI/CD tools such as Husky
-   If needed, add an Auth system
-   Better error handling system, including custom made exception classes
-   Improve the Swagger interface which is not perfect right now.

## Assumptions

Please note that I made the assumption that if a negative transactions request arrives </br>
with timestamp earlier than all other positive transactions for the same payer, than the transaction is invalid. </br>
For example, the sequence:

```bash
curl -i -X POST http://localhost:3000/transactions -H 'Content-Type: application/json'  -d '{"payer":"DANNON", "points":1000, "timestamp":"2020-11-02T14:00:00Z"}'
```

```bash
curl -i -X POST http://localhost:3000/transactions -H 'Content-Type: application/json'  -d '{ "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" }'
```

```bash
curl -i -X POST http://localhost:3000/transactions -H 'Content-Type: application/json'  -d '{ "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" }'
```

Will result:

```bash
HTTP/1.1 400 Bad Request
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 113
ETag: W/"71-ca3Gpi3ZSIdTcabOtZxDfrKSY0c"
Date: Sat, 06 Nov 2021 15:43:27 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"statusCode":400,"message":"Unable to process transaction, payer points will be negative","error":"Bad Request"}⏎
```

## Requirement

-   Node.js

## Installation

```bash
$ npm install
```

## Running the app

The Server will start automatically on port 3000

```bash
$ npm start
```

## Test

```bash
# e2e tests
$ npm run test:e2e
```

# REST API

## Swagger - API visualization

```
GET /api
```

```
curl -i -X GET http://localhost:3000/api
```

## Create transaction

```
POST /transactions
```

```bash
#Body
{
    payer: String,
    points: Integer,
    timestamp: ISO8601 Date String
}
```

```bash
#Example
curl -i -X POST http://localhost:3000/transactions -H 'Content-Type: application/json'  -d '{"payer":"DANNON", "points":1000, "timestamp":"2020-11-02T14:00:00Z"}'
```

```bash
#Response
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 49
ETag: W/"31-ZbI033DSvx1cDteiJeLs9fLZtPI"
Date: Sat, 06 Nov 2021 15:04:28 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Successfully added new transactions"}⏎
```

## Spend points

```
POST /points/spend
```

```bash
#Body
{
    points: Positive Integer
}
```

```bash
#Example
curl -i -X POST http://localhost:3000/points/spend -H 'Content-Type: application/json'  -d '{"points":200}'
```

```bash
#Response
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 81
ETag: W/"51-7Cv2wXSWw/pXI8cgRDVrNr+wZbI"
Date: Sat, 06 Nov 2021 15:23:29 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Successfully spent points","data":[{"payer":"DANNON","points":-200}]}⏎
```

## Get Points Balance

```
GET /points
```

```bash
#Example
curl -i -X GET http://localhost:3000/points
```

```bash
#Response
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 74
ETag: W/"4a-AX/xy3oiNSpIkUz3EfhBUERBA4Y"
Date: Sat, 06 Nov 2021 15:28:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Successfully returned points balance","data":{"DANNON":800}}⏎
```
