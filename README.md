![logo](https://cloud.githubusercontent.com/assets/3315274/26538833/b38b6d96-447b-11e7-84c8-b5bd05d8fa4c.png)

#

VisMOOC is the first visual analytic system developed by [VisLab](vis.cse.ust.hk), [HKUST](http://www.ust.hk/) for domain experts to analyze large-scale data of MOOCs. It provides course instructors and education analysts intuitive, interative and comprehensive analysis by integrating course videos, data visualization, and statistical analysis into one system. Multi-exploration techniques are offered for analysis at different levels. The data include clickstream data when students interact with course videos, grading data for assignments and exams, and forum data.

## VisMOOC Projects
The VisMooc system consists of three parts, namely, `Data Server`, `Web Server`, and `Frontend`. The `Data Server` is responsible for data processing and analysis. We support to import data both from the raw data or from MOOCDB. The `Web Server` serves as the backend of our interactive visualization system. It achieves a high concurrency by utilizing state-of-the-art techniques such as Node.js and Koa with optimization. The `Frontend` part incorporates several visualization components that adopts a MMVM architecture with one-way data flow.

<table width="100%">
<tbody width="100%">
   <tr>
    <th>&nbsp;</th>
    <th>
      <p>Data Server</p>
      <a href="https://github.com/HKUST-VISLab/vismooc-data-server"><img src="https://img.shields.io/github/stars/HKUST-VISLab/v-logger.svg?style=social&label=vismooc-data-server" height="20"></a>
      <a href="https://github.com/HKUST-VISLab"><img src="https://img.shields.io/github/followers/HKUST-VISLab.svg?style=social&label=Follow" height="20"></a>
    </th>
    <th>
      <p>Web Server</p>
      <a href="https://github.com/HKUST-VISLab/vismooc-web-server"><img src="https://img.shields.io/github/stars/HKUST-VISLab/v-logger.svg?style=social&label=vismooc-web-server" height="20"></a>
      <a href="https://github.com/HKUST-VISLab"><img src="https://img.shields.io/github/followers/HKUST-VISLab.svg?style=social&label=Follow" height="20"></a>
    </th>
    <th>
      <p>Frontend</p>
      <a href="https://github.com/HKUST-VISLab/vismooc-front-end"><img src="https://img.shields.io/github/stars/HKUST-VISLab/v-logger.svg?style=social&label=vismooc-frontend" height="20"></a>
      <a href="https://github.com/HKUST-VISLab"><img src="https://img.shields.io/github/followers/HKUST-VISLab.svg?style=social&label=Follow" height="20"></a>
    </th>
  <tr>
   <tr>
    <th align="right">Language</th>
    <td align="center"><a href="https://www.python.org/" ><img src="https://img.shields.io/badge/python-3.5-blue.svg"></a></td>
    <td align="center"><a href="https://www.typescriptlang.org/" ><img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg"></a><a href="https://nodejs.org/en/" ><img src="https://img.shields.io/node/v/wechaty.svg?maxAge=604800"></a></td>
    <td align="center"><a href="http://es6-features.org/" ><img src="https://img.shields.io/badge/ECMAScript-6-yellow.svg"></a></td>
  </tr>
  <tr>
    <th align="right">Libraries</th>
    <td align="center">
      <a href="https://github.com/mher/pymongo">PyMongo</a>,
      <a href="https://github.com/PyMySQL/PyMySQL">PyMySQL</a>,
      <a href="http://www.nltk.org/">NLTK</a>
    </td>
    <td align="center">
      <a href="https://github.com/koajs/koa">Koa</a>,
      <a href="http://mongoosejs.com/">Mongoose</a>,
    </td>
    <td align="center">
      <a href="https://vuejs.org/">Vue.js</a>,
      <a href="https://d3js.org/">D3.js</a>,
    </td>
  </tr>
  <tr>
    <th align="right">Status</th>
    <td align="center">
        <a href="https://travis-ci.org/HKUST-VISLab/vismooc-data-server"><img src="https://travis-ci.org/HKUST-VISLab/vismooc-data-server.svg?branch=master" /></a><br>
        <a href="https://codeclimate.com/repos/592ab22319c972027a002465/coverage"><img src="https://codeclimate.com/repos/592ab22319c972027a002465/badges/4036d9d8942155cedb5d/coverage.svg" /></a>
    </td>
    <td align="center">
        <a href="https://travis-ci.org/HKUST-VISLab/vismooc-web-server"><img src="https://travis-ci.org/HKUST-VISLab/vismooc-web-server.svg?branch=master" /> </a><br>
        <a href="https://codeclimate.com/repos/592ab295839b1e02650008c6/coverage"><img src="https://codeclimate.com/repos/592ab295839b1e02650008c6/badges/72c646f31634a87f8623/coverage.svg" /></a><br>
        <a href="https://david-dm.org/HKUST-VISLab/vismooc-web-server"><img src="https://david-dm.org/HKUST-VISLab/vismooc-web-server/status.svg" /></a><br>
    </td>
    <td align="center">
        <a href="https://travis-ci.org/HKUST-VISLab/vismooc-front-end"><img src="https://travis-ci.org/HKUST-VISLab/vismooc-front-end.svg?branch=master"/></a><br>
        <a href="https://www.bithound.io/github/chenzhutian/vismooc-front-end"><img src="https://www.bithound.io/projects/badges/57872a00-4375-11e7-9c37-9b439aefd03b/score.svg"/></a><br>
        <a href="https://www.bithound.io/github/chenzhutian/vismooc-front-end/master/dependencies/npm"><img src="https://www.bithound.io/projects/badges/57872a00-4375-11e7-9c37-9b439aefd03b/dependencies.svg" /></a>
    </td>
  </tr>
  </tbody>
</table>

## VisMOOC Modules
The VisMOOC system allows users to analyze the MOOC data from multi-perspectives. We provide a flexible architecture that can integrate different modules for analyzing various perspectives of MOOC data. The `Basic Module` provides an overview on course and video statistics such as user demographics information and video temporal hotness. It also enables to explore and analyze different types of users' clickstream data. The `Forum Module` focuses on the course forum data. Specifically, we support analyzing user's sentiment at different scales and exploring the users' social network based on their posts and replies. The `Prediction Module` helps predict whether a user would dropout in the middle of the course. These components are still in development and we plan to develop more visualization components to enable MOOC analysis from a wider perspective.

<table width="100%">
<thead width="100%">
    <tr align="center">
        <th>Modules</th>
        <th>Features</th>
        <th>Publications</th>
    </tr>
</thead>
<tbody width="100%">
    <tr>
        <th align="right">Basic</th>
        <td> <ul>
            <li>Course popularity</li>
            <li>User demographics information</li>
            <li>Clickstream analysis</li>
            <li>Temporal hotness analysis</li>
        </ul></td>
        <td>
            [1, 2, 3, 4]
        </td>
    </tr>
    <tr>
        <th align="right">Forum</th>
        <td><ul>
            <li>Sentiment analysis</li>
            <li>Social network analysis</li>
        </ul></td>
        <td>[5, 6]</td>
    </tr>
    <tr>
        <th align="right">Prediction</th>
        <td><ul>
            <li>Dropout analysis</li>
            <li>To be continued</li>
        </ul></td>
        <td>[7]</td>
    </tr>
</tbody>
</table>


## Publications

1. Conglei Shi, Siwei Fu, Qing Chen, and Huamin Qu. "VisMOOC: Visualizing video clickstream data from massive open online courses." Visual Analytics Science and Technology (VAST), 2014 IEEE Conference on. IEEE, 2014.

2. Conglei Shi, Siwei Fu, Qing Chen, and Huamin Qu. "VisMOOC: Visualizing video clickstream data from massive open online courses", PACIFICVIS, 2015, Visualization Symposium, IEEE Pacific, Visualization Symposium, IEEE Pacific 2015.

3. Huamin Qu, Qing Chen. "Visual Analytics of Data from MOOCs", IEEE Computer Graphics and Applications (CG&A) 2015.

4. Qing Chen, Yuanzhe Chen, Dongyu Liu, Conglei Shi, Yingcai Wu, Huamin Qu. "PeakVizor: Visual Analytics of Peaks in Video Clickstreams from Massive Open Online Courses", IEEE Transactions on Visualization and Computer Graphics, 2015.

5. Tongshuang Wu, Yuan Yao, Yuqing Duan, Xinzhi Fan, Huamin Qu. "NetworkSeer: Visual analysis for social network in MOOCs", PACIFICVIS, 2016, Visualization Symposium, IEEE Pacific, Visualization Symposium, IEEE 2016.

6. Siwei Fu, Jian Zhao, Weiwei Cui, Huamin Qu. "Visual Analysis of MOOC Forums with iForum", IEEE Transactions on Visualization and Computer Graphics, 2016.

7. Yuanzhe Chen, Qing Chen, Mingqian Zhao, Sebastien Boyer, Kalyan Veeramachaneni, Huamin Qu. "DropoutSeer: Visualizing Learning Patterns in Massive Open Online Courses for Dropout Reasoning and Prediction", In IEEE VAST 2016.


## Requirement

### OS
OS: Debian 8 (amd64)

### Software
- Docker

### Hardware
- CPU: Intel core i5-6500 @3.20GHz， 4 cores
- RAM: 8G
- Disk: Hard disk, >= 100Gb (actually, it depends on the size of dbsnapshot)

## Installation

1. install Docker and Docker-compose
2. Setting your MySQL password and MySQL data path in the file `docker-compose.yaml`.
3. Setting the configuration under the folder `config`, then save the configuration as `config.json`.
4. Build the images and run the container `sudo docker-compose up -d`

