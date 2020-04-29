import { SourceSalesforce, TargetConsole, SalesforceTable, Scheduler } from './classes';
// import * as c from './config.json'
// const config = c as Config

import * as fs from 'fs';
const config: Config = JSON.parse(fs.readFileSync('config.json').toString()) as Config;
// TODO validate config against json schema

(async () => {    
    try {
        let scheduler: Scheduler = new Scheduler(config)
        let resultStatus =  await scheduler.run()  
        // console.log(resultStatus)
    } catch (e) {
        console.log('ERROR ', e.message)
    }    
}
)()
