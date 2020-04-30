# Salesforce data downloader
An application that lets you download data from your salesforce org into multiple formats. The app also lets you to hash sensitive data at column level a.k.a data masking
See **Features** section below for all features planned and available.

# Table of contents

- [Salesforce data downloader](#salesforce-data-downloader)
  - [Motivation](#motivation)
  - [Quickstart](#quickstart)
  - [Glossary](#glossary)
  - [Features](#features)
  - [Configuration](#configuration)
  - [Status report](#status-report)
  - [Usage](#usage)
    - [Option 1: Use pre compiled binary](#option-1-use-pre-compiled-binary)
    - [Option 2: Build the code](#option-2-build-the-code)
  - [Fun fact](#fun-fact)
  - [Gotchas](#gotchas)
  - [Appendix 1: How to obtain access_token](#appendix-1-how-to-obtain-accesstoken)

## Motivation
Although there are many popular tools/apps out there that let you extract or download data from a Saleforce org, most of them have grave limitations unless you want to pay up (I wont be surprised that even after paying up you will not get the flexibility) e.g. lack of data masking, unable to download certain tables, limits on number of rows etc.


## Quickstart
- Download the latest release from [here](https://github.com/mannharleen/salesforce-data-downloader/releases). Note that the current release v1.0.0 relies on you providing an access_token in the config.json file below. For help on how to obtain an access_token, visit Appendix 1.
- Create a minimal config.json file (as below) in the same folder as the downloaded executable. Note that the below config.json file will download all data from salesforce
```json
{
    "sourceOptions": {
        "accessToken": "xxx",
        "instanceUrl": "https://ap4.salesforce.com"
    },
    "tableOptions": {
        "account": {}
    }
}
```
- Run the executable! Tip: Use CTR+C to exit anytime

You should see an output like this:
```
[Account                       ] ████████████████████████████████████████ 100% | Progress=3823/3823 | ETA(s)=0 | Elapsed(s)=8 | status=success | startedAt=1588082418087 | stoppedAt=1588082425858
```
- The downloaded data will be under the _downloaded folder
- And a _status.json file will also be under the _downloaded folder

## Glossary

|Term | Definition |
|------|------------|
|Authenticator| Given Salesforce credentials, used to authenticated with Salesforce to obtain an access_token and an instance URL |
|Source| The Salesforce org where data is sourced/downloaded from|
|Target| The target where data is downloaded to|
|Status| A status report is printed at the end of the downnlod job. For more info read the 'status report' section below |

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
    - [ ] csvFiles
    - [ ] database


## Configuration
Config is supplied by default in config.json

Important notes on configuration:
| Configuration key | Type of value | Properties | Notes |
|-------------------|---------------|-------|--------|
| sourceOptions             | object    | Required  | Provide config values for Salesforce org here |
| sourceOptions.accessToken | string    | Required  | |
| sourceOptions.instanceUrl | string    | Required  | |
| sourceOptions.apiVersion  | string    | Not Required; Default = v42.0 | |
| sourceOptions.excludeTables  | array    | Not Required; but recommended to have | The SAMPLE-config.json file provides some good defaults that you should keep in your config.json file. For reasoning, refer to section named "Fun fact" below |
| targetOptions             | object    | Not Required  | Provide config values for Target here |
| targetOptions.targetType                  | string    | Not Required; One of console/jsonFile; Default = jsonFile  |  |
| targetOptions.jsonFileOptions             | object    | Not Required  |  |
| targetOptions.jsonFileOptions.folderName  | string    | Not Required; Default = _downloaded  |  |
| tableOptions              | object    | Not Required | Provide config values for Tables aka Objects |
| tableOptions.<tableName>              | object    | Not Required | |
| tableOptions.<tableName>.columnNames              | array    | Not Required | |
| tableOptions.<tableName>.predicate              | string    | Not Required | |
| tableOptions.<tableName>.maskColumnNames              | array    | Not Required | maskColumnNames only work for columns included in columnNames|
| printStatus               | object | Not Required | Provide config values for printing the status report. More on status report in the below sections | 
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

## Status report
The application collates status of each table as well as a summary level status for the entire download job. The status report can be configured using config.json (as described above) using the **printStatus** config option.

- The status file is generated at the end of the job run.
- The status file by default is named _status and present in the _downloaded folder. The file name and the folder are configurable.

The status file takes the following schema:
```typescript
{
    summaryStatus: {
        startedAt: number
        stoppedAt: number
        status: string
        numTablesSuccessStatus: number
        numTablesErrorStatus: number
        message: string
        fullMessage: string
        totalRows: number
        retrievedRows: number
        timeTakenInSec: number
    },
    detailedStatus: {
       <tableNameXYZ>: {
            salesforceTable: SalesforceTable
            startedAt: number
            stoppedAt: number
            status: string
            message: string
            fullMessage: string
            totalRows: number
            retrievedRows: number
            timeTakenInSec: number

        },
        .....
    }

}
```

## Usage

### Option 1: Use pre compiled binary

- Download the latest release from [here](https://github.com/mannharleen/salesforce-data-downloader/releases)

| Supported Platforms |
|----------|
| Win x64  |
| |

- Create a config.json file in the same folder as the downloaded executable. You could use a same config file provided [here](https://raw.githubusercontent.com/mannharleen/salesforce-data-downloader/master/SAMPLE-config.json)
- Execute the executable

### Option 2: Build the code
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

With the configured parallelism of 20, the app produces the following stats:
It took under 1 min to download more than 16.5k records.
```javascript
    "summaryStatus": {
        "startedAt": 1588252332072,
        "stoppedAt": 1588252391212,
        "status": "success&error",
        "message": "",
        "fullMessage": "",
        "totalRows": 16674,
        "retrievedRows": 16674,
        "timeTakenInSec": 59.14,
        "numTablesErrorStatus": 61,
        "numTablesSuccessStatus": 345
    }
```

On the _status.json I ran the following nodejs code to obtain a list of all errors:
```javascript
cosnt fs = require('fs')
let s = JSON.parse(fs.readFileSync('./_downloaded/_status.json', 'utf8'))
let errorOnly = Object.values(s.detailedStatus).filter(x=> x.status === 'error').map(x=> {return {"tableName": x.salesforceTable.tableName, "message":x.message}})
console.log(errorOnly)
```
And that returned:
<details>
  <summary>Click to expand!</summary>
```
[ { tableName: 'AccountChangeEvent',
    message:
     'Could not read AccountChangeEvent [{"message":"entity type AccountChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ActivityHistory',
    message:
     'Could not read ActivityHistory [{"message":"entity type ActivityHistory does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'AggregateResult',
    message:
     'Could not read AggregateResult [{"message":"entity type AggregateResult does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'AssetChangeEvent',
    message:
     'Could not read AssetChangeEvent [{"message":"entity type AssetChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'AssetTokenEvent',
    message:
     'Could not read AssetTokenEvent [{"message":"entity type AssetTokenEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'AttachedContentDocument',
    message:
     'Could not read AttachedContentDocument [{"message":"entity type AttachedContentDocument does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'CampaignChangeEvent',
    message:
     'Could not read CampaignChangeEvent [{"message":"entity type CampaignChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'CaseChangeEvent',
    message:
     'Could not read CaseChangeEvent [{"message":"entity type CaseChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'CombinedAttachment',
    message:
     'Could not read CombinedAttachment [{"message":"entity type CombinedAttachment does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ContactChangeEvent',
    message:
     'Could not read ContactChangeEvent [{"message":"entity type ContactChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ContentBody',
    message:
     'Could not read ContentBody [{"message":"entity type ContentBody does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ContentDocumentLink',
    message:
     `Could not read ContentDocumentLink [{"message":"Implementation restriction: ContentDocumentLink requires a filter by a single Id on ContentDocumentId or LinkedEntityId using the equals operator or multiple Id's using the IN operator.","errorCode":"MALFORMED_QUERY"}]` },
  { tableName: 'ContentFolderItem',
    message:
     `Could not read ContentFolderItem [{"message":"Implementation restriction: ContentFolderItem requires a filter by Id or ParentContentFolderId using the equals or 'IN' operator","errorCode":"MALFORMED_QUERY"}]` },
  { tableName: 'ContentFolderMember',
    message:
     'Could not read ContentFolderMember [{"message":"Implementation restriction: ContentFolderMember requires a filter by a single Id, ChildRecordId or ParentContentFolderId using the equals operator","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'DataStatistics',
    message:
     'Could not read DataStatistics [{"message":"Where clauses should contain StatType","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'DatacloudAddress',
    message:
     'Could not read DatacloudAddress [{"message":"SObject - DATACLOUD_ADDRESS : Transient queries are not implemented","errorCode":"EXTERNAL_OBJECT_EXCEPTION"}]' },
  { tableName: 'DatacloudCompany',
    message:
     `Could not read DatacloudCompany [{"message":"Your organization doesn't have permission to access the Data.com API","errorCode":"DATACLOUD_API_DISABLED_EXCEPTION"}]` },
  { tableName: 'DatacloudContact',
    message:
     `Could not read DatacloudContact [{"message":"Your organization doesn't have permission to access the Data.com API","errorCode":"DATACLOUD_API_DISABLED_EXCEPTION"}]` },
  { tableName: 'DatacloudDandBCompany',
    message:
     'Could not read DatacloudDandBCompany [{"message":"Datacloud D&B company is not filterable without a criteria.","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'DatasetExportEvent',
    message:
     'Could not read DatasetExportEvent [{"message":"entity type DatasetExportEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'EmailStatus',
    message:
     'Could not read EmailStatus [{"message":"entity type EmailStatus does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'EntityParticle',
    message:
     'Could not read EntityParticle [{"message":"EntityParticle: a filter on a reified column is required [EntityDefinitionId,FieldDefinitionId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'EventChangeEvent',
    message:
     'Could not read EventChangeEvent [{"message":"entity type EventChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'EventRelationChangeEvent',
    message:
     'Could not read EventRelationChangeEvent [{"message":"entity type EventRelationChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'FeedLike',
    message:
     'Could not read FeedLike [{"message":"entity type FeedLike does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'FeedSignal',
    message:
     'Could not read FeedSignal [{"message":"entity type FeedSignal does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'FeedTrackedChange',
    message:
     'Could not read FeedTrackedChange [{"message":"entity type FeedTrackedChange does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'FieldDefinition',
    message:
     'Could not read FieldDefinition [{"message":"FieldDefinition: a filter on a reified column is required [EntityDefinitionId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'FlexQueueItem',
    message:
     'Could not read FlexQueueItem [{"message":"The WHERE clause must contain a JobType field expression.","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'FolderedContentDocument',
    message:
     'Could not read FolderedContentDocument [{"message":"entity type FolderedContentDocument does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'IdeaComment',
    message:
     'Could not read IdeaComment [{"message":"Implementation restriction. When querying the Idea Comment object, you must filter using the following syntax: CommunityId = [single ID], Id = [single ID], IdeaId = [single ID], Id IN [list of IDs], or IdeaId IN [list of IDs].","errorCode":
RY"}]' },
  { tableName: 'LeadChangeEvent',
    message:
     'Could not read LeadChangeEvent [{"message":"entity type LeadChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ListEmailChangeEvent',
    message:
     'Could not read ListEmailChangeEvent [{"message":"entity type ListEmailChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'ListViewChartInstance',
    message:
     'Could not read ListViewChartInstance [{"message":"Getting all ListViewChartInstances is unsupported","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'LogoutEventStream',
    message:
     'Could not read LogoutEventStream [{"message":"entity type LogoutEventStream does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'LookedUpFromActivity',
    message:
     'Could not read LookedUpFromActivity [{"message":"entity type LookedUpFromActivity does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'Name',
    message:
     'Could not read Name [{"message":"entity type Name does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'NoteAndAttachment',
    message:
     'Could not read NoteAndAttachment [{"message":"entity type NoteAndAttachment does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OpenActivity',
    message:
     'Could not read OpenActivity [{"message":"entity type OpenActivity does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OpportunityChangeEvent',
    message:
     'Could not read OpportunityChangeEvent [{"message":"entity type OpportunityChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OrderChangeEvent',
    message:
     'Could not read OrderChangeEvent [{"message":"entity type OrderChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OrderItemChangeEvent',
    message:
     'Could not read OrderItemChangeEvent [{"message":"entity type OrderItemChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OrgLifecycleNotification',
    message:
     'Could not read OrgLifecycleNotification [{"message":"entity type OrgLifecycleNotification does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OutgoingEmail',
    message:
     'Could not read OutgoingEmail [{"message":"This query is not supported on the OutgoingEmail object.","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'OutgoingEmailRelation',
    message:
     'Could not read OutgoingEmailRelation [{"message":"This query is not supported on the OutgoingEmail object.","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'OwnedContentDocument',
    message:
     'Could not read OwnedContentDocument [{"message":"entity type OwnedContentDocument does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'OwnerChangeOptionInfo',
    message:
     'Could not read OwnerChangeOptionInfo [{"message":"OwnerChangeOptionInfo: a filter on a reified column is required [EntityDefinitionId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'PicklistValueInfo',
    message:
     'Could not read PicklistValueInfo [{"message":"PicklistValueInfo: a filter on a reified column is required [EntityParticleId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'PlatformAction',
    message:
     'Could not read PlatformAction [{"message":"Getting all PlatformAction entities is unsupported","errorCode":"EXTERNAL_OBJECT_UNSUPPORTED_EXCEPTION"}]' },
  { tableName: 'ProcessInstanceHistory',
    message:
     'Could not read ProcessInstanceHistory [{"message":"entity type ProcessInstanceHistory does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'Product2ChangeEvent',
    message:
     'Could not read Product2ChangeEvent [{"message":"entity type Product2ChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'QuoteTemplateRichTextData',
    message:
     'Could not read QuoteTemplateRichTextData [{"message":"entity type QuoteTemplateRichTextData does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'RelationshipDomain',
    message:
     'Could not read RelationshipDomain [{"message":"RelationshipDomain: a filter on a reified column is required [FieldId,ChildSobjectId,ParentSobjectId,RelationshipInfoId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'RelationshipInfo',
    message:
     'Could not read RelationshipInfo [{"message":"RelationshipInfo: a filter on a reified column is required [ChildSobjectId,FieldId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'SearchLayout',
    message:
     'Could not read SearchLayout [{"message":"SearchLayout: a filter on a reified column is required [EntityDefinitionId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'SiteDetail',
    message:
     'Could not read SiteDetail [{"message":"SiteDetail: a filter on a reified column is required [DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'TaskChangeEvent',
    message:
     'Could not read TaskChangeEvent [{"message":"entity type TaskChangeEvent does not support query","errorCode":"INVALID_TYPE_FOR_OPERATION"}]' },
  { tableName: 'UserEntityAccess',
    message:
     'Could not read UserEntityAccess [{"message":"UserEntityAccess: a filter on a reified column is required [UserId,DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'UserFieldAccess',
    message:
     'Could not read UserFieldAccess [{"message":"UserFieldAccess: a filter on a reified column is required [DurableId]","errorCode":"MALFORMED_QUERY"}]' },
  { tableName: 'UserRecordAccess',
    message:
     'Could not read UserRecordAccess [{"message":"Can select only RecordId, a Has*Access field, and MaxAccessLevel","errorCode":"INVALID_FIELD"}]' },
  { tableName: 'Vote',
    message:
     `Could not read Vote [{"message":"Implementation restriction: When querying the Vote object, you must filter using the following syntax: ParentId = [single ID], Parent.Type = [single Type], Id = [single ID], or Id IN [list of ID's].","errorCode":"MALFORMED_QUERY"}]` } ]
```
</details>

> As you may notice, the errors are all valid, in that its not an application error, but Salesforce either does not allow querying these objects or needs predicates. This is the reason why the SAMPLE-config.json file conatins these objects in the exludeTables array.

Just for comparion sake, include these columns in the excludeTables array of config.json file, the app produces the following results:
Note - no errors
```json
"summaryStatus": {
    "startedAt": 1588253479468,
    "stoppedAt": 1588253529115,
    "status": "success",
    "message": "",
    "fullMessage": "",
    "totalRows": 16674,
    "retrievedRows": 16674,
    "timeTakenInSec": 49.647,
    "numTablesErrorStatus": 0,
    "numTablesSuccessStatus": 345
    }
```

## Gotchas
1. If you see weird multiple lines of progress instead of progress bar updating on the same line, try increasing your terminal screen buffer.
For Windows command prompt a value of 300 is recommended, go to properties->layout->Screen Buffer Size->Width=300
2. On rare occasions, when running SOQL on Salesforce, it will return a body specifying (via the field 'totalSize') that the total number of records = N, but in reality the total number of records it sends back will be less than N. This was observed on one particular object named 'FieldPermissions' during pagination using 'nextRecordsUrl'. Technically, 'done' = true was returned by salesforce before total number of rows = N were returned. This app throws a WARNING on the console and on the final status report if this happens.

## Appendix 1: How to obtain access_token
If you have a valid credentials for a salesforce user and the client id & secret of a connected app, you could use postman or curl to send an HTTP request to obtain the access_token
```shell
#  an example using curl
curl -X POST \
  'https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id=<CLIENTID>&client_secret=<CLIENTSECRET>&username=<USERNAME>&password=<PASSWORD>' \
  -H 'cache-control: no-cache'

```