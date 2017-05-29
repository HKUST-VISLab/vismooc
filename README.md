# VicMOOC@v0.3.9
VisMOOC is the first visual analytic system developed by [VisLab](vis.cse.ust.hk), [HKUST](http://www.ust.hk/) for domain experts to analyze large-scale data of MOOCs. It provides course instructors and education analysts intuitive, interative and comprehensive analysis by integrating course videos, data visualization, and statistical analysis into one system. Multi-exploration techniques are offered for analysis at different levels. The data include clickstream data when students interact with course videos, grading data for assignments and exams, and forum data.

(based on [vismooc-data-server@v0.4.0](https://github.com/HKUST-VISLab/vismooc-data-server/releases/tag/v0.4.0) and 
[vismooc-web-server@v0.5.0](https://github.com/HKUST-VISLab/vismooc-web-server/releases/tag/v0.4.9)).

## VisMOOC Projects
          |Data Server | Web Server | Frontend
----------|------------|------------|---------
Repositories|<a href="https://github.com/chenzhutian/vismooc-data-server"><img src="https://img.shields.io/github/stars/chenzhutian/vismooc-data-server.svg?style=social&label=~vismooc-data-server" height="20"></a>|<a href="https://github.com/chenzhutian/vismooc-web-server"><img src="https://img.shields.io/github/stars/chenzhutian/vismooc-web-server.svg?style=social&label=~vismooc-web-server" height="20"></a>|<a href="https://github.com/chenzhutian/vismooc-frontend"><img src="https://img.shields.io/github/stars/chenzhutian/vismooc-frontend.svg?style=social&label=~vismooc-frontend" height="20"></a>
Language|Python|TypeScript, Node.js|ECMAScript 6
Libraries|[PyMongo](https://github.com/mher/pymongo), [PyMySQL](https://github.com/PyMySQL/PyMySQL), [NLTK](http://www.nltk.org/)|[Koa](https://github.com/koajs/koa), [Mongoose](http://mongoosejs.com/)|[Vue.js](https://vuejs.org/), [D3.js](https://d3js.org/)
Status|[![Python version](https://img.shields.io/badge/python-3.5-blue.svg)](http://vis.cse.ust.hk/) [![Build Status](https://travis-ci.com/chenzhutian/vismooc-data-server.svg?token=iCzC3448sGQmSeYdNFro&branch=master)](https://travis-ci.com/chenzhutian/vismooc-data-server) [![Test Coverage](https://codeclimate.com/repos/592ab22319c972027a002465/badges/4036d9d8942155cedb5d/coverage.svg)](https://codeclimate.com/repos/592ab22319c972027a002465/coverage)|[![Build Status](https://travis-ci.com/chenzhutian/vismooc-web-server.svg?token=iCzC3448sGQmSeYdNFro&branch=master)](https://travis-ci.com/chenzhutian/vismooc-web-server)[![codecov](https://codecov.io/gh/chenzhutian/vismooc-web-server/branch/dev/graph/badge.svg?token=ch6DvUT6RS)](https://codecov.io/gh/chenzhutian/vismooc-web-server)[![Test Coverage](https://codeclimate.com/repos/592ab295839b1e02650008c6/badges/72c646f31634a87f8623/coverage.svg)](https://codeclimate.com/repos/592ab295839b1e02650008c6/coverage)[![bitHound Dependencies](https://www.bithound.io/projects/badges/d9bc67c0-4374-11e7-a311-7b68633f7cb1/dependencies.svg)](https://www.bithound.io/github/chenzhutian/vismooc-web-server/master/dependencies/npm)[![bitHound Overall Score](https://www.bithound.io/projects/badges/d9bc67c0-4374-11e7-a311-7b68633f7cb1/score.svg)](https://www.bithound.io/github/chenzhutian/vismooc-web-server)|[![Build Status](https://travis-ci.com/chenzhutian/vismooc-front-end.svg?token=iCzC3448sGQmSeYdNFro&branch=master)](https://travis-ci.com/chenzhutian/vismooc-front-end)[![bitHound Overall Score](https://www.bithound.io/projects/badges/57872a00-4375-11e7-9c37-9b439aefd03b/score.svg)](https://www.bithound.io/github/chenzhutian/vismooc-front-end)[![bitHound Dependencies](https://www.bithound.io/projects/badges/57872a00-4375-11e7-9c37-9b439aefd03b/dependencies.svg)](https://www.bithound.io/github/chenzhutian/vismooc-front-end/master/dependencies/npm)

## VisMOOC Modules

Modules|Analytical Features | Publications 
----------|------------|----------
VisMOOC course module|Course popularity, user demographics| [1, 2, 3]
VisMOOC video module|Clickstream analysis, temporal hotness analysis| [1, 2, 3, 4]
VisMOOC forum module|Sentiment analysis, social network analysis| [5, 6]
VisMOOC prediction module|Dropout analysis| [7]
## Requirement:

### OS
OS: Debian 8 (amd64)

### Software
- Docker

### Hardware
- CPU: Intel core i5-6500 @3.20GHz， 4 cores
- RAM: 8G
- Disk: Hard disk, >= 100Gb (actually, it depends on the size of dbsnapshot)

## Installation

### Docker
1. install Docker and Docker-compose

### vismooc
1. Build the images and run the container `sudo docker-compose up -d`

## Publications

1. Conglei Shi, Siwei Fu, Qing Chen, and Huamin Qu. "VisMOOC: Visualizing video clickstream data from massive open online courses." Visual Analytics Science and Technology (VAST), 2014 IEEE Conference on. IEEE, 2014.

2. Conglei Shi, Siwei Fu, Qing Chen, and Huamin Qu. "VisMOOC: Visualizing video clickstream data from massive open online courses", PACIFICVIS, 2015, Visualization Symposium, IEEE Pacific, Visualization Symposium, IEEE Pacific 2015.

3. Huamin Qu, Qing Chen. "Visual Analytics of Data from MOOCs", IEEE Computer Graphics and Applications (CG&A) 2015.

4. Qing Chen, Yuanzhe Chen, Dongyu Liu, Conglei Shi, Yingcai Wu, Huamin Qu. "PeakVizor: Visual Analytics of Peaks in Video Clickstreams from Massive Open Online Courses", IEEE Transactions on Visualization and Computer Graphics, 2015.

5. Tongshuang Wu, Yuan Yao, Yuqing Duan, Xinzhi Fan, Huamin Qu. "NetworkSeer: Visual analysis for social network in MOOCs", PACIFICVIS, 2016, Visualization Symposium, IEEE Pacific, Visualization Symposium, IEEE 2016.

6. Siwei Fu, Jian Zhao, Weiwei Cui, Huamin Qu. "Visual Analysis of MOOC Forums with iForum", IEEE Transactions on Visualization and Computer Graphics, 2016.

7. Yuanzhe Chen, Qing Chen, Mingqian Zhao, Sebastien Boyer, Kalyan Veeramachaneni, Huamin Qu. "DropoutSeer: Visualizing Learning Patterns in Massive Open Online Courses for Dropout Reasoning and Prediction", In IEEE VAST 2016.