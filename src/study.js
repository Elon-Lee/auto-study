const config = require('../config');
const fse = require("fs-extra");

const { video: videoConfig, studyTypes } = config;

// 参考资料
const studyMaterial = async (page) => {
  // const url = 'https://lms.ouchn.cn/course/50000000143/learning-activity/full-screen#/50000020602';
  //
  // await page.goto(url, {
  //   waitUntil: 'networkidle0' // 网络空闲说明加载完毕
  // });
  await page.waitForSelector('.attachment-row');

  const list = await page.$$('.attachment-row');

  for (let i = 0; i < list.length; i++) {
    // 打开附件
    await list[i].click();
    await page.waitForTimeout(Math.floor(Math.random() * 1000 + 6000));
    const closeBtn = await page.$('#file-previewer-with-note .right.close');
    closeBtn.click();
    await page.waitForTimeout(Math.floor(Math.random() * 1000 + 3000));
  }
}

// 视频或视频
const playVideoOrAudio = async (page, tag = 'video') => {
  let playBtn = null;
  if (tag === 'video') {
    playBtn = await page.waitForSelector('.mvp-toggle-play.mvp-first-btn-margin');
  } else {
    playBtn = await page.waitForSelector('.audio-player-wrapper > .play > a')
  }
  playBtn.click();
  await page.evaluate(async (videoConfig, tag) => {
    return new Promise((resolve) => {
      const { playbackRate = 1, muted = false, volume = 0.5 } = videoConfig;
      const ele = document.querySelector(tag);
      // 当前播放进度
      let currentTime = ele.currentTime;
      // 倍速播放
      ele.playbackRate = playbackRate;
      // 是否静音
      ele.muted = muted;
      // 音量（0.0 - 1.0）
      ele.volume = volume;
      const timer = setTimeout(() => {
        const current = ele.currentTime;
        console.log(`current:${current}currentTime:${currentTime}`)
        if (parseInt(current) === currentTime && current!==0) {
          resolve()
        }
      }, 10 * 1000);

      ele.addEventListener('ended', () => {
        clearTimeout(timer);
        console.log("ended:")
        resolve();
      })
      ele.addEventListener('error', () => {
        clearTimeout(timer);
        console.log("error:")
        resolve();
      })
      ele.addEventListener('play', () => {
        currentTime = ele.currentTime;
        console.log("video time:"+currentTime)
      })
    })
  }, videoConfig, tag);
}

// 音视频教材
const studyOnlineVideo = async (page) => {

  await page.waitForSelector('.mvp-videos-box');
  let time = Math.floor(Math.random() * 1000 + 5000);
  console.log("wait :",time)
  await page.waitForTimeout(time);
  const video = await page.$('video');
  const audio = await page.$('audio');
  if (video) {
    await playVideoOrAudio(page, 'video');
  }
  if (audio) {
    await playVideoOrAudio(page, 'audio');
  }
}

const study = async (page, courses) => {
  console.log('study...')

  for (let i = 0; i < courses.length; i++) {
    const { children } = courses[i];
    for (let x = 0; x < children.length; x++) {
      try {
        const {type, href, id, title, status} = children[x];
        if (studyTypes.indexOf(type) === -1) {
          continue;
        }
        if (status === 'full') {
          continue;
        }
        console.log(`${type} - ${id} - ${title}`);
        await page.goto(href, {
          waitUntil: 'networkidle2' // 网络空闲说明加载完毕
        });
        console.log("page loaded...");

        if (type === '参考资料') {
          await studyMaterial(page);
        }
        if (type === '音视频教材') {
          await studyOnlineVideo(page);
        }
        //设置已观看
        children[x].status = "full";
        //更新json
        await fse.writeFile('./data.json', JSON.stringify(courses, undefined, 2));
        // 停留几秒钟
        await page.waitForTimeout(Math.floor(Math.random() * 1000) + 3000);
      } catch (e){
        console.log("学习当前课程错误:自动学习下一章节:",e)
      }
    }
  }
}

module.exports = study;
