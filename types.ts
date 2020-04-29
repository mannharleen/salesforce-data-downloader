interface SalesforceTable {
    tableName: string
    tableColumns?: string[]
}

interface Source {
    read: (salesforceConnection: any, salesforceTable: any) => Promise<any>
}

interface TableStatus {
    salesforceTable: SalesforceTable
    startedAt: number
    stoppedAt: number
    status: string
    message: string
    fullMessage: string
    totalRows: number
    retrievedRows: number
    timeTakenInSec: number

}

interface SchedulerStatus {
    [salesforceTableName: string]: TableStatus
}

interface Target {
    targetType: string
    write: (data: any) => Promise<any>
}

interface Config {
    sourceOptions: {
        accessToken: string
        instanceUrl: string
        apiVersion: string
    }
    targetOptions: {
        targetType: string,
        jsonFileOptions: {
            folderName: string
        }
    }
    tableOptions: {
        [tableName: string]: {
            columnNames: string[]
            predicate: string
            maskColumnNames: string[]
        }
    },
    printStatus: {
        printStatus: boolean,
        printStatusTo: string,
        jsonFileOptions: {
            folderName: string
        }
    },
    jobOptions: {
        parallelNumTasks: number
    }
}

// type TargetOptions = {
//     targetType: string
// }[]

// interface ResponseJsonDescribeObject {
//     fields: {name: string}[]
// }

// interface ResponseJsonDataObject {
//     records: any[]
// }