import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber'
import 'dotenv/config'
import { getPerformanceGoals } from './browser'
import { setPerformanceGoal, triggerCanvas } from './io/braze'

setDefaultTimeout(60 * 1000);

const canvasesIds = {
    'collabs-daily-card-cycle': process.env.COLLABS_DAILY_CARD_CYCLE_LOGIC,
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Then('performance goals {string} must equal {string}', async function (attr, val) {
    const pg = await getPerformanceGoals()
    if (pg[attr] !== val) {
        throw new Error(`Performance goal ${attr} is ${pg[attr]} but expected ${val}`)
    }
});

When(`performance goals {string} is set to {string}`, function (attr: string, val: string) {
    // orchestrate braze user set
    return setPerformanceGoal(attr, val)
})

When(`canvas {string} is triggered`, async function (canvasId) {
    await triggerCanvas(canvasesIds[canvasId])
})
