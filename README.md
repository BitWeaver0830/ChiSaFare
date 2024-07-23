# chi-sa-fare-web-app
Aggregatore di professionisti ed artigiani


## INTRODUZIONE

Project details here .... 


Node.js modules used:

* [dayjs](https://www.npmjs.com/package/dayjs)

    Day.js is a minimalist JavaScript library that parses, validates, manipulates, and displays dates and times for modern browsers with a largely Moment.js-compatible API

* [dotenv](https://www.npmjs.com/package/dotenv)
    
    Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology

* [nodemon](https://www.npmjs.com/package/nodemon)
    
    nodemon is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected

## SETUP

```sh
npm install
```

And then to run in production mode:

```sh
npm run production
```

or in development mode:

```sh
npm run development
```

## APIs

### Request
`GET /api`
    curl -i -H 'Accept: application/json' https://[CLOUD_URL_HERE]/api
### Response
StatusCode        : 200
StatusDescription : OK
Content           : {
                        "status":200,
                        "detail":"API works properly"
                    }

