# HomexCloud Microservices

<<<<<<< .mine
Microservices contains all of the Lambda Functions & exposed as api with API gateway Integration.

## Prerequisites

> NodeJS = 8:10v  </br>
> Serverless Framework =  1.32.0v </br>
> AWS account Keys With full admin access </br>

## Project structure

```
├───App
│   handler
│   ├── config
│   ├── controller
│   ├── middleware
│   ├── locales
│   ├── route
│   ├── auth
│   ├── db
│   ├── errors

```

### src directory

Contains all TypeScript files for this project

##### /config

Contains constants that are environment specific

#### /controller

Contains controller that are mapped to routes, there 
*must be no business logic here*

#### /middleware

Contains custom middleware

#### src/route

All routes are mapped here. Authentication middleware is mapped
to router.


## IDE

It is highly recommended to use IDE that supports nodeJS, such as
Visual Studio Code.


## API Documentation

- [SwaggerHub](https://app.swaggerhub.com/apis-docs/HomeXCloudAPI/homexcloud/1.0.0)




API Documentation is hosted by ccs-microservices project by utilizing Swagger.
Swagger specification can be found [here](http://swagger.io/specification/).

## Source Code Repository
> `git clone https://github.com/HomeX2018/homexCloud-microservices.git`

## My Setup

Terminals open running these commands:

* npm install -g serverless
* serverless config credentials --provider aws --key accessKey --secret secretKey
* serverless deploy
||||||| .r4
this is a test repository
commit 2
=======
Test Repository for Lambda Deployment

Source: https://www.youtube.com/watch?v=aGI4Wlm5c9U
>>>>>>> .r53
