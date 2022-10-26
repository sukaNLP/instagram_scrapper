const type = {
    CLICK_ON_MORE_BUTTON: 'clickOnMoreButton',
    SCRAPE_COMMENTS: 'scrapeComments',
    CONSOLE_LOG: 'consoleLog'
}

const answer = {
    OK: 'ok',
    FAIL: 'fail'
};

const sendMessage = (type, payload, callback = () => { }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { type, payload },
            callback,
        );
        buttonClicks = 0;
    });
};

const action = {
    [type.CLICK_ON_MORE_BUTTON]: () => sendMessage(
        type.CLICK_ON_MORE_BUTTON,
        null,
        payload => {
            if (payload === answer.OK) {
                consoleLog(`Button was succesfully clicked.`);
            } else if (payload === answer.FAIL) {
                consoleLog(`Problem with button click.`)
                chrome.alarms.clear('buttonAlarm')
                consoleLog('Clearing buttonAlarm alarm.')
                scrapeComments()
            }
            else { consoleLog(`Unregistred error with button click.`) }

        },
    ),
    [type.SCRAPE_COMMENTS]: () => sendMessage(
        type.SCRAPE_COMMENTS,
        null,
        payload => {
            if (payload.length) {
                consoleLog('Succesfully scarped comments!');
                consoleLog(payload);
            } else {
                consoleLog('Problem with scraping...')
            }
        },
    ),
    [type.CONSOLE_LOG]: payload => sendMessage(type.CONSOLE_LOG, payload)
}

const clickOnMoreButton = () => action[type.CLICK_ON_MORE_BUTTON]();
const scrapeComments = () => action[type.SCRAPE_COMMENTS]();
const consoleLog = payload => action[type.CONSOLE_LOG](payload);

chrome.alarms.onAlarm.addListener(() => {
    consoleLog('Trying to click a button.')
    clickOnMoreButton()
})

const handleInit = () => {
    consoleLog('Initializing extension...');
    consoleLog('Creating buttonAlarm alarm.');
    chrome.alarms.create('buttonAlarm', { periodInMinutes: 0.01 })
}

chrome.action.onClicked.addListener(handleInit);