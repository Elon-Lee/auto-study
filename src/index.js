const puppeteer = require('puppeteer-core');
const fse = require('fs-extra');
const dotenv = require('dotenv');
const getData = require('./getData');
const study = require('./study');
const config = require('../config');

const {   userAgent } = config;

dotenv.config();

/**
 * 主函数
 * @returns {Promise<void>}
 */
async function  autoStudy()  {
  const { baseURL } = config

  const { SESSION,executablePath } = process.env;
  if (!SESSION) {
    console.warn('缺少 SESSION 。')
    return;
  }

  const browser = await puppeteer.launch({
    headless: false,
    executablePath,
    defaultViewport: {
      width: 1200,
      height: 900
    },
  });

  setTimeout(async () => {
    await getData(page);
    await browser.close();
  }, 3 * 60 * 60 * 1000); //每天学习x...个小时

  const page = await browser.newPage();

  await page.setDefaultTimeout(60 * 1000);

  await page.setCookie({
    url: baseURL,
    name: 'session',
    value: SESSION,
  });

  await page.setUserAgent(userAgent);

  let newData = [];
  try {
    const data = await fse.readFile('./data.json');
    newData = JSON.parse(data.toString());
    console.log('使用 data.json 缓存');
  } catch (err) {
    newData = await getData(page);
  }

  await study(page, newData);

  // 获取最新进度
  await getData(page);

  await browser.close();
}

/**
 * 设置每日定时任务
 * @param {*} hour 小时
 * @param {*} minute 分钟
 * @param {*} callTask 任务函数
 */
function setScheduledTask(hour, minute, callTask) {
  let taskTime = new Date();
  taskTime.setHours(hour);
  taskTime.setMinutes(minute);
  let timeDiff = taskTime.getTime() - (new Date()).getTime(); // 获取时间差
  timeDiff = timeDiff > 0 ? timeDiff : (timeDiff + 24 * 60 * 60 * 1000);
  setTimeout(function() {
    callTask(); // 首次执行
    setInterval(callTask, 24 * 60 * 60 * 1000); // 24小时为循环周期
  }, timeDiff);
}

/**
 * 每日定时执行 几点 几分
 */
// setScheduledTask(10,0,autoStudy) ;
autoStudy();
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
