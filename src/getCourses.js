const config = require('../config');

const { baseURL } = config;

const getCourses = async (page) => {

  const url = `${baseURL}/user/courses#/`

  await page.goto(url, {
    waitUntil: 'networkidle0' // 网络空闲说明加载完毕
  });
  let ngscop =await page.waitForSelector('.course.ng-scope');
  //先点击元素才有对应的选项点击 important
  (await page.$('#s2id_autogen1')).click();
  await page.waitForTimeout(1000);
  const select = await page.$('.select2-line-content[title="30"]');
  select.click()
  console.log("设置每页30条...")
  await page.waitForTimeout(5000);
  const list = await page.$$('.course.ng-scope');
  const courses = [];
  for (let i = 0; i < list.length; i++) {
    const id = await page.evaluate(el => el.getAttribute('data-course-id'), list[i]);
    const title = await list[i].$eval('.course-name', el => el.getAttribute('original-title'));
    const href = await list[i].$eval('.course-name > a', el => el.getAttribute('href'));
    courses.push({ id, title, href: `${baseURL}${href}` });
  }
  // 截图
  // await page.screenshot({ path: './images/courses.png', fullPage: true });
  return courses
}

module.exports = getCourses;
