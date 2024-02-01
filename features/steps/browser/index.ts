import 'dotenv/config'
import * as puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'
import { AfterAll } from '@cucumber/cucumber'

interface PerformanceGoals {
    tier: string
    cycle_post_count: string
    cycle_share_count: string
}

let __browser: puppeteer.Browser = null
let __browserPage: puppeteer.Page = null
let __performanceGoals: PerformanceGoals = null

const wsChromeEndpointurl = fs.readFileSync(path.join(__dirname, './chrome-socket-url'), 'utf8').toString().trim()

async function ensureBrowser() {
    if (!__browser) {
        console.log(`connecting`)
        __browser = await puppeteer.connect({
            browserWSEndpoint: wsChromeEndpointurl,
            defaultViewport: null,
        });
        console.log(`connected`)
    }
    
    if (!__browserPage) {
        __browserPage = await __browser.newPage()
        __browserPage.setCacheEnabled(false)
    }
}

async function goToProfile() {
    await ensureBrowser()

    await __browserPage.goto(`https://dashboard-03.braze.com/users/user_search/${process.env.BRAZE_DASHBOARD_ID}?query=${process.env.BRAZE_TEST_USER_ID}&locale=en`)
    await __browserPage.reload()
}

async function debugElements(...elements: puppeteer.ElementHandle[]) {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const elementHTML = await element.evaluate(element => element.outerHTML);
        console.log(elementHTML);
    }
}

export function cleanCache() {
    __performanceGoals = null
}

export async function getPerformanceGoals():Promise<PerformanceGoals> {
    if (__performanceGoals) {
        return __performanceGoals
    }

    await goToProfile()

    const performanceGoalsSel = `::-p-text(performance_goals)`
    
    const performanceGoalsElem = await __browserPage.waitForSelector(performanceGoalsSel)
    const parent = await performanceGoalsElem.evaluateHandle(element => {
        return element.parentElement.parentElement
    })
    const btn = await parent.waitForSelector(`button`)
    await btn.press('Enter')
    const perfGoalsScreen = `div.bcl-modal-dialog > div > div.bcl-modal-body > div > div.bcl-collapsible-body`
    const perfGoalsScreenElem = await __browserPage.waitForSelector(perfGoalsScreen)
    let propName = ''
    const perfGoalsData = (await perfGoalsScreenElem.evaluate(element => element.outerText)).split('\n').filter(Boolean).reduce((p, c, i) => {
        if (i % 2 === 0) {
            propName = c
            return p
        } 

        p[propName] = c
        return p
    }, {})
    
    __performanceGoals = perfGoalsData as PerformanceGoals

    setTimeout(() => {
        __performanceGoals = null
    }, 300)

    return __performanceGoals
}

AfterAll(async () => {
    if (__browser) {
        await __browserPage.close()
        await __browser.disconnect()
    }
})
