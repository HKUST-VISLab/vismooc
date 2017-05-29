# VicMOOC@v0.3.9
VisMOOC is the first visual analytic system developed by [VisLab](vis.cse.ust.hk), [HKUST](http://www.ust.hk/) for domain experts to analyze large-scale data of MOOCs. It provides course instructors and education analysts intuitive, interative and comprehensive analysis by integrating course videos, data visualization, and statistical analysis into one system. Multi-exploration techniques are offered for analysis at different levels. The data include clickstream data when students interact with course videos, grading data for assignments and exams, and forum data.

(based on [vismooc-data-server@v0.4.0](https://github.com/HKUST-VISLab/vismooc-data-server/releases/tag/v0.4.0) and 
[vismooc-web-server@v0.5.0](https://github.com/HKUST-VISLab/vismooc-web-server/releases/tag/v0.4.9)).

## VisMOOC Projects
Test|Data Server | Web Server | Frontend
----------|------------|------------|---------
Language|Python|TypeScript, Node.js|ECMAScript 6


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