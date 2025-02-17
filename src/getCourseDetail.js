const config = require('../config');

const { baseURL } = config;

const getCourseDetail = async (page, course) => {

  const { href, id, title } = course;
  const children = [];

  const name = `${id} - ${title}`;

  console.log(name);

  await page.goto(href, {
    waitUntil: 'networkidle0' // 网络空闲说明加载完毕
  });
  // 等待页面渲染完毕
  // await page.waitForTimeout(10000);
  await page.waitForSelector('#course-section');

  // // 只显示未完成的课程
  const filterInput = await page.$('.formative-task-filter.ng-scope input');
  await filterInput.click();
  // 点击展开所有课程
  const toggleBtn = await page.$('#course-section');
  await toggleBtn?.click();
  await page.waitForSelector('.learning-activity.ng-scope');
  const list = await page.$$('.learning-activity.ng-scope');

  for (let i = 0; i < list.length; i++) {
    let itemId = await page.evaluate(el => el.getAttribute('id'), list[i])
    itemId = itemId.replace('learning-activity-', '');
    const type = await list[i].$eval('.font', el => el.getAttribute('title'));
    const title = await list[i].$eval('.activity-title > a.title', el => el.textContent);

    // const href = `${baseURL}/course/${id}/learning-activity/full-screen#/${itemId}`;
    const href = `${baseURL}/course/${id}/learning-activity#/${itemId}`;
    const { status, statusStr } = await list[i].$eval('.activity-operations-container > .completeness', el => {
      return {
        status: el.getAttribute('class').replace('completeness', '').trim(),
        statusStr: el.getAttribute('title'),
      }
    })
    children.push({ id: itemId, type, title, href, status, statusStr })
  }

  // 课程详情页截图
  // await page.screenshot({ path: `./images/${name}.png`, fullPage: true });
  return { ...course, children };
}

module.exports = getCourseDetail;
