# Salesforce data downloader
An application that lets you download data from your salesforce org into multiple formats. The app also lets you to hash sensitive data at column level a.k.a data masking
See **Features** section below for all features available.

## Quickstart
- Download the latest release from [here](https://github.com/mannharleen/salesforce-data-downloader/releases).
- Create a minimal config.json file (as below) in the same folder as the downloaded executable. Note that the below config.json file will download all data from salesforce
```json
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com"
    }
}
```
- Run the executable! Tip: Use CTR+C to exit anytime

You should see an output like this:
```
[AcceptedEventRelation         ] ████████████████████████████████████████ 100% | Progress=0/0 | ETA(s)=NULL | Elapsed(s)=3 | status=success | startedAt=1588082415556 | stoppedAt=1588082418085
[Account                       ] ████████████████████████████████████████ 100% | Progress=3823/3823 | ETA(s)=0 | Elapsed(s)=8 | status=success | startedAt=1588082418087 | stoppedAt=1588082425858
[AccountChangeEvent            ] █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 2% | Progress=2/100 | ETA(s)=123 | Elapsed(s)=3 | status=error | startedAt=1588082425860 | stoppedAt=1588082428361
[AccountCleanInfo              ] ████████████████████████████████████████ 100% | Progress=0/0 | ETA(s)=NULL | Elapsed(s)=3 | status=success | startedAt=1588082428362 | stoppedAt=1588082430896
........................
........................
```

## Glossary

|Term | Definition |
|------|------------|
|Authenticator| Given Salesforce credentials, used to authenticated with Salesforce to obtain an access_token and an instance URL |
|Source| The Salesforce org where data is sourced/downloaded from|
|Target| The target where data is downloaded to|
|Status||

## Gotchas
If you see weird multiple lines of progress instead of progress bar updating on the same line, try increasing your terminal screen buffer.
For Windows command prompt a value of 300 is recommended, go to properties->layout->Screen Buffer Size->Width=300

## Features

- [ ] Authentication to cover multiple oAuth grant types supported by Salesforce
- [x] Progress bar for each object (aka table)
- [x] Include all objects
- [x] Specify objects to be included
- [x] Specify objects to be exclude
- [x] Take care of scenarios when #rows in a object > 2000 i.e. pagination
- [x] Data masking (hashing) at column level of an object
- [x] Provide Salesforce API version to use
- [x] Print final status to console or to a file
- [x] Set parallelism i.e. number of tables to work with in parallel
- [x] Validate config.json schema
- [ ] Command-line flag to specify custom file name for config file
- [x] Ability to take a predicate (a where clause, limit clause) to download a subset of the object rows
- [ ] Use custom salesforce domain to login? check: is it even required?
- [ ] Ability to disable progress bars
- [x] Provide summary status in status report
- [ ] Provide a web based UI to create the config.json
- [ ] Following targets are available
    - [x] console
    - [x] jsonFile; produces a file that contains an array. May produce multiple files per object with a prefix such as _000, _001 etc.
    - [ ] jsonlinesFile; one file per object that contains a row per line
    - [ ] database


## Config via config.json
Config is supplied by default in config.json

Important notes on configuration:
| Configuration key | Type of value | Properties | Notes |
|-------------------|---------------|-------|--------|
| sourceOptions             | object    | Required  | Provide config values for Salesforce org here |
| sourceOptions.accessToken | string    | Required  | |
| sourceOptions.instanceUrl | string    | Required  | |
| sourceOptions.apiVersion  | string    | Not Required; Default = v42.0 | |
| sourceOptions.excludeTables  | array    | Not Required | |
| targetOptions             | object    | Not Required  | Provide config values for Target here |
| targetOptions.targetType                  | string    | Not Required; One of console/jsonFile; Default = jsonFile  |  |
| targetOptions.jsonFileOptions             | object    | Not Required  |  |
| targetOptions.jsonFileOptions.folderName  | string    | Not Required; Default = _downloaded  |  |
| tableOptions              | object    | Not Required | Provide config values for Tables aka Objects |
| tableOptions.<tableName>              | object    | Not Required | |
| tableOptions.<tableName>.columnNames              | array    | Not Required | |
| tableOptions.<tableName>.predicate              | string    | Not Required | |
| tableOptions.<tableName>.maskColumnNames              | array    | Not Required | maskColumnNames only work for columns included in columnNames|
| printStatus               | object | Not Required | Provide config values for printing the final status of all tables | 
| printStatus.printStatus   | boolean | Not Required; Default = true |  | 
| printStatus.printStatusTo   | string | Not Required; One of console/jsonFile; Default = jsonFile |  | 
| printStatus.jsonFileOptions   | object | Not Required |  | 
| printStatus.jsonFileOptions.folderName   | string | Not Required; Default = _downloaded |  | 
| jobOptions    | object | Not Required | Provide config values for the downloader |
| jobOptions.parallelNumTasks    | string | Not Required; Default = 20; Must be between 1 and 30 |  |

Thus, any of the below are valid configurations:
```json
// smallest possible config.json
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com"
    }
}
```
```json
// Explicitly mentioning everything
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com",
        "apiVersion:: v47.0",
        "excludeTables": ["contact"]
    },
    "targetOptions": {
        "targetType": "jsonFile",
        "jsonFileOptions": {
            "folderName": "_downloaded"
        }
    },
    "tableOptions": {
        "account": {
            "columnNames": [
                "id",
                "name"
            ],
            "predicate": "limit 1",
            "maskColumnNames": ["name"]
        },
        "contact": {
            "columnNames": [
                "id"
            ],
            "predicate": "limit 1"
        }
    },
    "printStatus": {
        "printStatus": true,
        "printStatusTo": "jsonFile",
        "jsonFileOptions": {
            "folderName": "_downloaded"
        }
    },
    "jobOptions": {
        "parallelNumTasks": 20
    }
}
```
```javascript
// Skipping some configs that makes them take default values
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com"
        // if "apiVersion" is not mentioned, defaults to v42.0
        // if "excludeTables" is not mentioned, defaults to exclude nothing
    },
    "targetOptions": {
        "targetType": "console" // if "targetType" == console, "jsonFileOptions" is not required
                                // if "targetType" == jsonFile and "jsonFileOptions" is skipped, "jsonFileOptions.folderName" is defaulted to _downloaded
    },
    "tableOptions": {
        "account": {
            // Absence of "columnsNames" implies include all columns for download
            // Absence of "predicate" implies no predicate to be used i.e. download all rows
            // Absence of "maskColumnNames" implies not to mask/hash any column
        },
        "contact": {
            "columnNames": [], // empty array of "columnNames" implies include all columns for download
            "predicate": ""    // empty "predicate" implies no predicate to be used i.e. download all rows
            "maskColumnNames": [] // empty array of "maskColumnNames" implies not to mask/hash any column
        }
    },
    "printStatus": {
        "printStatus": true,
        "printStatusTo": "jsonFile", // if "targetType" == console, "jsonFileOptions" is not required
                                     // if "targetType" == jsonFile and "jsonFileOptions" is skipped, "jsonFileOptions.folderName" is defaulted to _downloaded        
    },
    "jobOptions": {
        "parallelNumTasks": 20
    }
}
```

## Usage

### Use pre compiled binary

- Download the latest release from [here](https://github.com/mannharleen/salesforce-data-downloader/releases)
| Supported Platforms |
|----------|
| Win x64  |
| |
- Create a config.json file in the same folder as the downloaded executable
- Execute the executable

### Build the code and run on nodejs
```
$ git clone <this repo>
$ cd salesforce-data-downloader
$ npm start
```

## Fun fact
Running this app with a minimal config.json file (below) will download all tables that are available at /sobjects/describe API
```json
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com"
    },
    "jobOptions": {
        "parallelNumTasks": 20
    }
}
```
As on Apr 2020, there were 406 objects.
- /sobjects/describe # = 406
- progress bars # = 406
- status.json # = 406