import fetch, { RequestInit } from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path'
import * as cliProgress from 'cli-progress'
import { eachLimit } from 'async';
import ajv from 'ajv';
import crypto from "crypto";

const configSchema = {
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "http://example.com/example.json",
  "type": "object",
  "title": "The Root Schema",
  "description": "The root schema comprises the entire JSON document.",
  "default": {},
  "additionalProperties": true,
  "required": [
    "sourceOptions",
    "targetOptions",
    "tableOptions",
    "printStatus",
    "jobOptions"
  ],
  "properties": {
    "sourceOptions": {
      "$id": "#/properties/sourceOptions",
      "type": "object",
      "title": "The Sourceoptions Schema",
      "description": "An explanation about the purpose of this instance.",
      "default": {},
      "examples": [
        {
          "accessToken": "abcdefg",
          "instanceUrl": "https://ap4.salesforce.com",
          "apiVersion": "v42.0",
          "excludeTables": ["account"]
        }
      ],
      "additionalProperties": true,
      "required": [
        "accessToken",
        "instanceUrl"
      ],
      "properties": {
        "accessToken": {
          "$id": "#/properties/sourceOptions/properties/accessToken",
          "type": "string",
          "title": "The Accesstoken Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
            "09awemakldnmaioew"
          ]
        },
        "instanceUrl": {
          "$id": "#/properties/sourceOptions/properties/instanceUrl",
          "type": "string",
          "title": "The Instanceurl Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "",
          "examples": [
            "https://ap4.salesforce.com"
          ]
        },
        "apiVersion": {
          "$id": "#/properties/sourceOptions/properties/apiVersion",
          "type": "string",
          "title": "The Apiversion Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "v42.0",
          "examples": [
            "v42.0"
          ]
        },
        "excludeTables": {
          "$id": "#/properties/tableOptions/properties/excludeTables",
          "type": "array",
          "title": "The excludeTables Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": [],
          "examples": [
            [
              "account",
              "contact"
            ]
          ],
          "additionalItems": true,
          "items": {
            "$id": "#/properties/tableOptions/properties/excludeTables",
            "type": "string",
            "title": "The Items Schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
              "account",
              "contact"
            ]
          }
        }
      }
    },
    "targetOptions": {
      "$id": "#/properties/targetOptions",
      "type": "object",
      "title": "The Targetoptions Schema",
      "description": "An explanation about the purpose of this instance.",
      "default": {},
      "examples": [
        {
          "targetType": "jsonFile",
          "jsonFileOptions": {
            "folderName": "_downloaded"
          }
        }
      ],
      "additionalProperties": false,
      "required": [
        "targetType",
        "jsonFileOptions"
      ],
      // "if": {
      //   "properties": {
      //     "targetType": {
      //       "const": "jsonFile"
      //     }
      //   },
      //   "required": [
      //     "targetType"
      //   ]
      // },
      // "then": {
      //   "required": [
      //     "jsonFileOptions"
      //   ]
      // },
      // "else": false,
      "properties": {
        "targetType": {
          "$id": "#/properties/targetOptions/properties/targetType",
          "type": "string",
          "enum:": [
            "console",
            "jsonFile"
          ],
          "title": "The Targettype Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "jsonFile",
          "examples": [
            "jsonFile"
          ]
        },
        "jsonFileOptions": {
          "$id": "#/properties/targetOptions/properties/jsonFileOptions",
          "type": "object",
          "title": "The Jsonfileoptions Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": {},
          "examples": [
            {
              "folderName": "_downloaded"
            }
          ],
          "additionalProperties": true,
          "required": [
            "folderName"
          ],
          "properties": {
            "folderName": {
              "$id": "#/properties/targetOptions/properties/jsonFileOptions/properties/folderName",
              "type": "string",
              "title": "The Foldername Schema",
              "description": "An explanation about the purpose of this instance.",
              "default": "_downloaded",
              "examples": [
                "_downloaded"
              ]
            }
          }
        }
      }
    },
    "tableOptions": {
      "$id": "#/properties/tableOptions",
      "type": "object",
      "title": "The Tableoptions Schema",
      "description": "An explanation about the purpose of this instance.",
      "default": {},
      "examples": [
        {
          "contact": {
            "columnNames": [
              "id"
            ],
            "predicate": ""
          },
          "account": {
            "predicate": "",
            "columnNames": [
              "id",
              "name"
            ]
          }
        }
      ],
      "additionalProperties": {
        "type": "object",
        "properties": {
          "columnNames": {
            "$id": "#/properties/tableOptions/properties/account/properties/columnNames",
            "type": "array",
            "title": "The Columnnames Schema",
            "description": "An explanation about the purpose of this instance.",
            "default": [],
            "examples": [
              [
                "id",
                "name"
              ]
            ],
            "additionalItems": true,
            "items": {
              "$id": "#/properties/tableOptions/properties/account/properties/columnNames/items",
              "type": "string",
              "title": "The Items Schema",
              "description": "An explanation about the purpose of this instance.",
              "default": "",
              "examples": [
                "id",
                "name"
              ]
            }
          },
          "predicate": {
            "$id": "#/properties/tableOptions/properties/account/properties/predicate",
            "type": "string",
            "title": "The Predicate Schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
              ""
            ]
          },
          "maskColumnNames": {
            "$id": "#/properties/tableOptions/properties/account/properties/maskColumnNames",
            "type": "array",
            "title": "The maskColumnNames Schema",
            "description": "An explanation about the purpose of this instance.",
            "default": [],
            "examples": [
              [
                "id",
                "name"
              ]
            ],
            "additionalItems": true,
            "items": {
              "$id": "#/properties/tableOptions/properties/account/properties/maskColumnNames/items",
              "type": "string",
              "title": "The Items Schema",
              "description": "An explanation about the purpose of this instance.",
              "default": "",
              "examples": [
                "id",
                "name"
              ]
            }
          }
        }
      }
    },
    "printStatus": {
      "$id": "#/properties/printStatus",
      "type": "object",
      "title": "The Printstatus Schema",
      "description": "An explanation about the purpose of this instance.",
      "default": {},
      "examples": [
        {
          "printStatus": true,
          "printStatusTo": "jsonFile",
          "jsonFileOptions": {
            "folderName": "_downloaded"
          }
        }
      ],
      "additionalProperties": true,
      "required": [
        "printStatus",
        "printStatusTo",
        "jsonFileOptions"
      ],
      // "if": {
      //   "properties": {
      //     "printStatusTo": {
      //       "const": "jsonFile"
      //     }
      //   },
      //   "required": [
      //     "printStatusTo"
      //   ]
      // },
      // "then": {
      //   "required": [
      //     "jsonFileOptions"
      //   ]
      // },
      // "else": false,
      "properties": {
        "printStatus": {
          "$id": "#/properties/printStatus/properties/printStatus",
          "type": "boolean",
          "title": "The Printstatus Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": true,
          "examples": [
            true
          ]
        },
        "printStatusTo": {
          "$id": "#/properties/printStatus/properties/printStatusTo",
          "type": "string",
          "enum": [
            "console",
            "jsonFile"
          ],
          "title": "The Printstatusto Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": "jsonFile",
          "examples": [
            "jsonFile"
          ]
        },
        "jsonFileOptions": {
          "$id": "#/properties/printStatus/properties/jsonFileOptions",
          "type": "object",
          "title": "The jsonFileOptions Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": {},
          "examples": [
            {
              "folderName": "_downloaded"
            }
          ],
          "additionalProperties": true,
          "required": [
            "folderName"
          ],
          "properties": {
            "folderName": {
              "$id": "#/properties/printStatus/properties/jsonFileOptions/properties/folderName",
              "type": "string",
              "title": "The Foldername Schema",
              "description": "An explanation about the purpose of this instance.",
              "default": "_downloaded",
              "examples": [
                "_downloaded"
              ]
            }
          }
        }
      }
    },
    "jobOptions": {
      "$id": "#/properties/jobOptions",
      "type": "object",
      "title": "The Joboptions Schema",
      "description": "An explanation about the purpose of this instance.",
      "default": {},
      "examples": [
        {
          "parallelNumTasks": 20.0
        }
      ],
      "additionalProperties": true,
      "required": [
        "parallelNumTasks"
      ],
      "properties": {
        "parallelNumTasks": {
          "$id": "#/properties/jobOptions/properties/parallelNumTasks",
          "type": "integer",
          "minimum": 1,
          "maximum": 100,
          "title": "The Parallelnumtasks Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": 20,
          "examples": [
            20
          ]
        }
      }
    }
  }
}

class SalesforceAuthenticator {
  authenticate: () => SourceSalesforce = () => {
    // TODO authentication logic
    // return SourceSalesforce
    return new SourceSalesforce('', '', '')
  }
}

class SourceSalesforce implements Source {
  constructor(public accessToken: string, public instanceUrl: string, public apiVersion: string) { }
  fetch: (path: string) => Promise<any> = async (path: string) => {
    try {
      // let fetchUrl = this.instanceUrl + path.replace(/\s/g, '+')
      let fetchUrl = this.instanceUrl + path

      let res = await fetch(fetchUrl, {
        headers: {
          'authorization': 'Bearer ' + this.accessToken
        }
      })
      let toReturn = {
        headers: res.headers,
        status: res.status,
        body: {}

      }
      if (res.headers.raw()['content-type'][0].includes('application/json')) {
        toReturn.body = await res.json()

      } else {
        toReturn.body = { message: await res.text() }

      }
      return toReturn
    } catch (e) {
      return Promise.reject(e)
    }

  }
  read: (salesforceTable: SalesforceTable, nextRecordsUrl?: string) => Promise<any> = (salesforceTable: SalesforceTable, nextRecordsUrl?: string) => this.soql(salesforceTable, nextRecordsUrl)

  soql: (salesforceTable: SalesforceTable, nextRecordsUrl?: string) => Promise<any> =
    async (salesforceTable: SalesforceTable, nextRecordsUrl?: string) => {
      let path: string
      if (nextRecordsUrl) {
        path = nextRecordsUrl
      } else {
        if (salesforceTable.predicate.length > 0) {
          let query = 'SELECT ' + salesforceTable.tableColumns.join(',') + ' FROM ' + salesforceTable.tableName + ' ' + salesforceTable.predicate
          path = '/services/data/' + this.apiVersion + '/query/?q=' + encodeURIComponent(query).replace(/\'/g, '%27')
        } else {
          let query = 'SELECT ' + salesforceTable.tableColumns.join(',') + ' FROM ' + salesforceTable.tableName
          path = '/services/data/' + this.apiVersion + '/query/?q=' + encodeURIComponent(query).replace(/\'/g, '%27')
        }
      }
      let res = await this.fetch(path)


      if (res.status === 200) {
        return res.body

      } else {
        return Promise.reject(new Error(`Could not read ${salesforceTable.tableName} ` + JSON.stringify(res.body)))
      }

    }
  describeObject: (salesforceTable: SalesforceTable) => Promise<any> =
    async (salesforceTable: SalesforceTable) => {
      // get all columns of a table
      let path = '/services/data/' + this.apiVersion + '/sobjects/' + salesforceTable.tableName + '/describe'
      let res = await this.fetch(path)
      let toReturn
      if (res.status === 200) {
        let records: any[] = res.body.fields
        toReturn = records.map(f => f.name)
      } else {
        return Promise.reject(new Error(`Could not describe ${salesforceTable.tableName} ` + JSON.stringify(res.body)))
      }
      return toReturn
    }
  describeAllObjects: () => Promise<string[]> =
    async () => {
      // get all columns of a table
      let path = '/services/data/' + this.apiVersion + '/sobjects/'
      let res = await this.fetch(path)
      if (res.status === 200) {
        let sobjects: any[] = res.body.sobjects
        return sobjects.map(f => f.name)
      } else {
        return Promise.reject(new Error(`Could not describe all objects ` + JSON.stringify(res.body)))
      }
    }
}

class SalesforceTable {
  tableColumns: string[] = []
  constructor(public tableName: string, tableColumns: string[], public predicate: string) {
    if (tableColumns.length > 0) {
      this.tableColumns = tableColumns
    }
  }
}

class TargetConsole implements Target {
  targetType = "console"
  write: (data: any) => Promise<any> = async (data: any) => {
    try {
      console.info(data)
    } catch (e) {
      return Promise.reject(e)
    }

  }
}

class TargetJsonFile implements Target {
  targetType = "jsonFile"
  fileName: string = ''
  constructor(public folderName: string) { }
  write: (data: any) => Promise<any> = async (data: any) => {
    try {
      await fs.promises.mkdir(this.folderName, { recursive: true })
      await fs.promises.writeFile(path.join(this.folderName, this.fileName + '.json'), JSON.stringify(data))
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

class Scheduler {
  public schedulerStatus: SchedulerStatus = {
    detailedStatus: {},
    summaryStatus: {
      startedAt: -1,
      stoppedAt: -1,
      status: '',
      message: '',
      fullMessage: '',
      totalRows: 0,
      retrievedRows: 0,
      timeTakenInSec: 0,
      numTablesErrorStatus: 0,
      numTablesSuccessStatus: 0
    }
  }
  sourceSalesforce: SourceSalesforce
  salesforceTables: SalesforceTable[]
  config: Config

  constructor(config: Config) {
    // ajv
    const ajvO = new ajv({ useDefaults: true, verbose: true })
    var validate = ajvO.compile(configSchema);
    let valid = validate(config)
    if (!valid) {
      console.log(config)
      throw new Error(JSON.stringify(validate.errors))
    }
    this.config = config

    // source
    this.sourceSalesforce = new SourceSalesforce(
      config.sourceOptions.accessToken,
      config.sourceOptions.instanceUrl,
      config.sourceOptions.apiVersion
    )
    this.salesforceTables = Object.keys(config.tableOptions).map(tableName => {
      return new SalesforceTable(tableName, config.tableOptions[tableName].columnNames, config.tableOptions[tableName].predicate)
    })
  }
  run: () => Promise<SchedulerStatus> = async () => {
    if (this.salesforceTables.length === 0) {
      // get all tablenames if not present in config
      let tableNames = await this.sourceSalesforce.describeAllObjects()
      this.salesforceTables = tableNames.map(tableName => new SalesforceTable(tableName, [], ''))
    }
    let target: Target
    if (this.config.targetOptions.targetType === 'console') {
      target = new TargetConsole()
    } else if (this.config.targetOptions.targetType === 'jsonFile') {
      target = new TargetJsonFile(this.config.targetOptions.jsonFileOptions.folderName)
    } else {
      return Promise.reject(new Error('invalid config.targetOptions.targetType = ' + this.config.targetOptions.targetType))
    }

    this.schedulerStatus.summaryStatus.startedAt = new Date().getTime()
    this.config.sourceOptions.excludeTables.forEach((excludeTable) => {
      let idx = this.salesforceTables.findIndex((x) => capitalize(x.tableName) === capitalize(excludeTable))
      if (idx >= 0) {
        this.salesforceTables.splice(idx, 1)
      }
    })
    for (let salesforceTable of this.salesforceTables) {
      
      this.schedulerStatus.detailedStatus[salesforceTable.tableName] = {
        salesforceTable: salesforceTable,
        status: "-",
        startedAt: -1,
        stoppedAt: -1,
        message: "",
        fullMessage: "",
        totalRows: 0,
        retrievedRows: 0,
        timeTakenInSec: 0
      }
    }
    // read & write
    await eachLimit(this.salesforceTables.map(salesforceTable => {
      return {
        sourceSalesforce: this.sourceSalesforce,
        salesforceTable: salesforceTable,
        target: target,
        tableStatus: this.schedulerStatus.detailedStatus[salesforceTable.tableName],
        // schedulerStatus: this.schedulerStatus,
        config: this.config
      }
    }),
      this.config.jobOptions.parallelNumTasks, // < 1 ? 0 : this.config.jobOptions.parallelNumTasks,
      asyncTask
    )

    this.schedulerStatus.summaryStatus.retrievedRows = Object.values(this.schedulerStatus.detailedStatus).map(tableStatus => tableStatus.retrievedRows).reduce((acc, v)=> acc+v)
    this.schedulerStatus.summaryStatus.totalRows = Object.values(this.schedulerStatus.detailedStatus).map(tableStatus => tableStatus.totalRows).reduce((acc, v)=> acc+v)
    let numTablesSuccessStatus = Object.values(this.schedulerStatus.detailedStatus).map(tableStatus => tableStatus.status).filter(x => x === 'success').length
    let numTablesErrorStatus = this.salesforceTables.length - numTablesSuccessStatus
    this.schedulerStatus.summaryStatus.status =  numTablesSuccessStatus === this.salesforceTables.length ? 'success' : numTablesErrorStatus === this.salesforceTables.length ? 'error' : 'success&error'
    this.schedulerStatus.summaryStatus.numTablesSuccessStatus = numTablesSuccessStatus
    this.schedulerStatus.summaryStatus.numTablesErrorStatus = numTablesErrorStatus
    this.schedulerStatus.summaryStatus.stoppedAt = new Date().getTime()
    this.schedulerStatus.summaryStatus.timeTakenInSec = (this.schedulerStatus.summaryStatus.stoppedAt - this.schedulerStatus.summaryStatus.startedAt)/1000
    
    if (this.config.printStatus.printStatus) {
      if (this.config.printStatus.printStatusTo === 'console') {
        console.log(this.schedulerStatus)
      } else if (this.config.printStatus.printStatusTo === 'jsonFile') {
        await fs.promises.mkdir(this.config.printStatus.jsonFileOptions.folderName, { recursive: true })
        await fs.promises.writeFile(path.join(this.config.printStatus.jsonFileOptions.folderName, '_status' + '.json'), JSON.stringify(this.schedulerStatus))
      } else {
        // do nothing :)
      }
    }
    return this.schedulerStatus
  }
}

async function asyncTask(o: any, callback: any) {
  let multiBar = new cliProgress.MultiBar({
    format: "{tableName} {bar} {percentage}% | Progress={value}/{total} | ETA(s)={eta} | Elapsed(s)={duration} | status={status} | startedAt={startedAt} | stoppedAt={stoppedAt} | message={message}",
    emptyOnZero: true
  }, cliProgress.Presets.shades_grey);
  const bar1 = multiBar.create(0, 0, {
    status: "-",
    tableName: '[' + o.salesforceTable.tableName + ' '.repeat((30 - o.salesforceTable.tableName.length) > 0 ? 30 - o.salesforceTable.tableName.length : 0) + ']'
  })

  o.tableStatus.status = 'started'
  o.tableStatus.startedAt = new Date().getTime()  
  let targetSuffix = 0
  let toReturn = await task(o.sourceSalesforce, o.salesforceTable, o.target, o.tableStatus, o.config, bar1, targetSuffix)
  multiBar.stop()
  callback()
}
// 1. get tableColumns if not provided in config
// 2. get data and write to target
async function task(sourceSalesforce: SourceSalesforce, salesforceTable: SalesforceTable, target: Target, tableStatus: TableStatus, config: Config, bar1: cliProgress.SingleBar, targetSuffix: number, nextRecordsUrl?: string): Promise<TableStatus> {
  try {

    if (salesforceTable.tableColumns.length == 0) {
      salesforceTable.tableColumns = await sourceSalesforce.describeObject(salesforceTable)
    }
    let body = await sourceSalesforce.read(salesforceTable, nextRecordsUrl)
    let records: any[] = body.records
    tableStatus.totalRows = body.totalSize
    let data = records.map(r => { delete r.attributes; return r })
    tableStatus.retrievedRows += data.length

    bar1.setTotal(tableStatus.totalRows)

    if (data.length > 0) {
      if (target.targetType === 'jsonFile') {
        // set the fileName to write
        let targetJsonFile = target as TargetJsonFile
        if (tableStatus.retrievedRows === tableStatus.totalRows || body.done) {
          targetJsonFile.fileName = salesforceTable.tableName + (targetSuffix === 0 ? '' : ('_00' + targetSuffix).substr(0, 4))
        } else {
          targetJsonFile.fileName = salesforceTable.tableName + ('_00' + targetSuffix).substr(0, 4)
        }
      }

      if (config.tableOptions[salesforceTable.tableName]) {

        for (let maskColumnName of config.tableOptions[salesforceTable.tableName].maskColumnNames) {
          maskColumnName = capitalize(maskColumnName)
          if (config.tableOptions[salesforceTable.tableName].columnNames.map(c => capitalize(c)).includes(maskColumnName)) {
            // need to hash some columns
            data = data.map(r => {
              let sha = crypto.createHash('sha256')
              sha.update(r[maskColumnName])
              r[maskColumnName] = sha.digest("hex")
              return r
            })
          }
        }
      }

      await target.write(data)
    }

    if (tableStatus.retrievedRows === tableStatus.totalRows || body.done) {
      // OBSERVATION: I observed for objectname='FieldPermissions' that while '"totalSize": 10747', the pagination return a total #rows = 8551 only.
      // Hence, resetting bar total
      bar1.setTotal(tableStatus.retrievedRows)
      // and throwing a warning
      if (tableStatus.retrievedRows < tableStatus.totalRows && body.done) {
        let warnMsg = `WARNING Salesforce says that for object named ${salesforceTable.tableName}, it has ${tableStatus.totalRows} #rows, but is sending only ${tableStatus.retrievedRows} #rows. Resetting tableStatus.totalRows to tableStatus.retrievedRows`        
        console.warn(warnMsg)
        tableStatus.totalRows = tableStatus.retrievedRows
        tableStatus.message = warnMsg
      }
      

      tableStatus.status = 'success'
      tableStatus.stoppedAt = new Date().getTime()
      tableStatus.timeTakenInSec = (tableStatus.stoppedAt - tableStatus.startedAt) /1000
      bar1.update(tableStatus.retrievedRows, tableStatus)
    } else {
      // more rows are present! i.e. done = false; nextRecordsUrl
      bar1.update(tableStatus.retrievedRows, tableStatus)
      // call task again
      let nextRecordsUrl = body.nextRecordsUrl
      targetSuffix += 1
      await task(sourceSalesforce, salesforceTable, target, tableStatus, config, bar1, targetSuffix, nextRecordsUrl)
    }

    return Promise.resolve(tableStatus)

  } catch (e) {
    tableStatus.status = 'error'
    tableStatus.stoppedAt = new Date().getTime()
    tableStatus.timeTakenInSec = (tableStatus.stoppedAt - tableStatus.startedAt)/1000
    bar1.increment(0, tableStatus)
    tableStatus.fullMessage = JSON.stringify(e)
    tableStatus.message = e.message
    return Promise.resolve(tableStatus)
  }
}

let capitalize = function (s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export { SalesforceAuthenticator, SourceSalesforce, TargetConsole, SalesforceTable, Scheduler }