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
          "apiVersion": "v42.0"
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
          "maximum": 30,
          "title": "The Parallelnumtasks Schema",
          "description": "An explanation about the purpose of this instance.",
          "default": 1,
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
        // throw new Error(`Could not read ${salesforceTable.tableName} ` + JSON.stringify(res.body))
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
        // throw new Error(`Could not describe ${salesforceTable.tableName} ` + JSON.stringify(res.body))
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
        // throw new Error(`Could not describe ${salesforceTable.tableName} ` + JSON.stringify(res.body))
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
  public schedulerStatus: SchedulerStatus = {}
  sourceSalesforce: SourceSalesforce
  salesforceTables: SalesforceTable[]
  config: Config

  constructor(config: Config) {
    // ajv
    const ajvO = new ajv({ useDefaults: true, verbose: true }) //new Ajv.default({ allErrors: true }) //  { useDefaults: true }
    var validate = ajvO.compile(configSchema);
    let valid = validate(config)
    // let valid = ajv.validate(configSchema, config)
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
      // note: if config.tableOptions.length == 0, then we take care of it during run()
      return new SalesforceTable(tableName, config.tableOptions[tableName].columnNames, config.tableOptions[tableName].predicate)
      // return config.tableOptions[tableName].columnNames.length > 0 ?
      //     new SalesforceTable(tableName, config.tableOptions[tableName].columnNames, config.tableOptions[tableName].predicate) :
      //     new SalesforceTable(tableName)
    })
  }
  run: () => Promise<SchedulerStatus> = async () => {
    if (this.salesforceTables.length === 0) {
      // get all tablenames if not present in config
      let tableNames = await this.sourceSalesforce.describeAllObjects()
      this.salesforceTables = tableNames.map(tableName => new SalesforceTable(tableName, [], ''))
    }
    // const multiBar: cliProgress.MultiBar = new cliProgress.MultiBar({
    //     // clearOnComplete: false,
    //     // hideCursor: false,
    //     // | Elapsed(s)={duration}
    //     format: "{tableName} {bar} {percentage}% | Progress={value}/{total} | ETA(s)={eta} | status={status} | startedAt={startedAt} | stoppedAt={stoppedAt} | message={message}",
    //     // forceRedraw: false,
    //     // linewrap: false,
    //     // noTTYOutput: true
    // }, cliProgress.Presets.shades_grey);
    //
    let target: Target
    if (this.config.targetOptions.targetType === 'console') {
      target = new TargetConsole()
    } else if (this.config.targetOptions.targetType === 'jsonFile') {
      target = new TargetJsonFile(this.config.targetOptions.jsonFileOptions.folderName)
    } else {
      return Promise.reject(new Error('invalid config.targetOptions.targetType = ' + this.config.targetOptions.targetType))
    }
    // create entry schedulerStatus with tableStatus for all tables
    for (let salesforceTable of this.salesforceTables) {
      this.schedulerStatus[salesforceTable.tableName] = {
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
        tableStatus: this.schedulerStatus[salesforceTable.tableName],
        config: this.config
      }
    }),
      this.config.jobOptions.parallelNumTasks < 1 ? 0 : this.config.jobOptions.parallelNumTasks,
      asyncTask
    )
    // for (let salesforceTable of this.salesforceTables) {                
    //     await task(this.sourceSalesforce, salesforceTable, target, this.schedulerStatus[salesforceTable.tableName], multiBar)
    // }

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
  }, cliProgress.Presets.shades_grey);
  const bar1 = multiBar.create(100, 0, {
    status: "-",
    tableName: '[' + o.salesforceTable.tableName + ' '.repeat((30 - o.salesforceTable.tableName.length) > 0 ? 30 - o.salesforceTable.tableName.length : 0) + ']'
  })

  o.tableStatus.status = 'started'
  o.tableStatus.startedAt = new Date().getTime()
  let targetSuffix = 0
  let toReturn = await task(o.sourceSalesforce, o.salesforceTable, o.target, o.tableStatus, bar1, targetSuffix, o.config)
  multiBar.stop()
  callback()
}
// 1. get tableColumns if not provided in config
// 2. get data and write to target
async function task(sourceSalesforce: SourceSalesforce, salesforceTable: SalesforceTable, target: Target, tableStatus: TableStatus, bar1: cliProgress.SingleBar, targetSuffix: number, config: Config, nextRecordsUrl?: string): Promise<TableStatus> {

  bar1.increment(1, tableStatus)

  try {

    if (salesforceTable.tableColumns.length == 0) {
      salesforceTable.tableColumns = await sourceSalesforce.describeObject(salesforceTable)
    }
    let body = await sourceSalesforce.read(salesforceTable, nextRecordsUrl)
    let records: any[] = body.records
    tableStatus.totalRows = body.totalSize
    let data = records.map(r => { delete r.attributes; return r })
    tableStatus.retrievedRows += data.length
    if (data.length > 0) {
      if (target.targetType === 'jsonFile') {
        // set the fileName to write
        let targetJsonFile = target as TargetJsonFile
        if (tableStatus.retrievedRows === tableStatus.totalRows) {
          targetJsonFile.fileName = salesforceTable.tableName + (targetSuffix === 0 ? '' : ('_00' + targetSuffix).substr(0, 4))
        } else {
          targetJsonFile.fileName = salesforceTable.tableName + ('_00' + targetSuffix).substr(0, 4)
        }

      }

      let capitalize = function(s : string): string {
        return s.charAt(0).toUpperCase() + s.slice(1)
      }
      for (let maskColumnName of config.tableOptions[salesforceTable.tableName].maskColumnNames) {
        maskColumnName = capitalize(maskColumnName)
        if (config.tableOptions[salesforceTable.tableName].columnNames.map(c => capitalize(c)).includes(maskColumnName)) {
          // need to hash some columns
          data = data.map(r => {
            r[maskColumnName] = crypto.createHash('sha256').update(r[maskColumnName]).digest("hex").toString()
            return r
          })
        }

      }
      await target.write(data)
    }

    bar1.setTotal(tableStatus.totalRows)
    bar1.increment(1, tableStatus)

    if (tableStatus.retrievedRows === tableStatus.totalRows) {
      tableStatus.status = 'success'
      tableStatus.stoppedAt = new Date().getTime()
      bar1.update(tableStatus.retrievedRows, tableStatus)
    } else {
      // more rows are present! i.e. done = false; nextRecordsUrl
      bar1.update(tableStatus.retrievedRows, tableStatus)
      // call task again
      let nextRecordsUrl = body.nextRecordsUrl
      targetSuffix += 1
      await task(sourceSalesforce, salesforceTable, target, tableStatus, bar1, targetSuffix, nextRecordsUrl)
    }

    return Promise.resolve(tableStatus)

  } catch (e) {
    tableStatus.status = 'error'
    tableStatus.stoppedAt = new Date().getTime()
    bar1.increment(1, tableStatus)
    tableStatus.message = e.message
    tableStatus.fullMessage = JSON.stringify(e)
    return Promise.resolve(tableStatus)
    // bar1.increment(1, {
    //     status: "error"
    // })
    // return Promise.reject(e)
  }
}
// }

export { SalesforceAuthenticator, SourceSalesforce, TargetConsole, SalesforceTable, Scheduler }