import 'dotenv/config'

interface DataToTrack {
    external_id: string,
    _merge_objects?: boolean,
    [key: string]: string | object | number | boolean | undefined,
}

interface UsersTrack {
    attributes: DataToTrack[],
}

interface TriggerCanvasRecipient {
    external_user_id: string,
}

interface TriggerCanvas {
    canvas_id: string,
    recipients: TriggerCanvasRecipient[]
}

const BRAZE_HOST_URL:string = process.env.BRAZE_HOST!

const headers = {
    'Content-Type': `application/json`,
    'Authorization': `Bearer ${process.env.BRAZE_KEY}`,
    'X-No-Braze-Queue-Processor': `true`
}

async function UsersTrack(dataToTrack: UsersTrack) {
    return fetch(`${BRAZE_HOST_URL}/users/track`, {
        method: `POST`,
        headers,
        body: JSON.stringify(dataToTrack),
    })
}

async function CanvasTrigger(dataToTrack: TriggerCanvas) {
    return fetch(`${BRAZE_HOST_URL}/canvas/trigger/send`, {
        method: `POST`,
        headers,
        body: JSON.stringify(dataToTrack),
    })
}

export async function setPerformanceGoal(prop: string, value: string) {
    return UsersTrack({
        attributes: [{
            external_id: process.env.BRAZE_TEST_USER_ID!,
            _merge_objects: true,
            performance_goals: {
                [prop]: value
            }    
        }]
    })
}

export async function triggerCanvas(canvas_id) {
    return CanvasTrigger({
        canvas_id,
        recipients: [
            {  
                external_user_id: process.env.BRAZE_TEST_USER_ID!
            }
        ]
    })
}
