const fse = require('fs-extra');
const getCourses = require('./getCourses');
const getCourseDetail = require('./getCourseDetail');

const getData = async (page) => {
  console.log('开始获取课程数据...');

  const courses = await getCourses(page);

  const newData = []

  for (let i = 0; i < courses.length; i++) {
   let courseDetail =  await getCourseDetail(page, courses[i])
    console.log(`课程名称${courseDetail.title}:课程章节数:${courseDetail.children.length}`)
    await newData.push(courseDetail);
  }

  await fse.writeFile('./data.json', JSON.stringify(newData, undefined, 2));

  console.log('data.json save success');

  return newData;
}

module.exports = getData;
