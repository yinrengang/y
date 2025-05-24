//全局变量
var oBox = document.getElementById("box"),
    oScore = document.getElementById("score"),
    oRe = document.getElementById("restart"),
    oLevel = document.getElementById("level"),
    oMap = document.getElementById("map"),
    oBiuAll = document.getElementById("BiuAll"),
    allBiu = oBiuAll.children,
    allReChild = oRe.children,
    boxOffsetTop = oBox.offsetTop,
    boxOffsetLeft = oBox.offsetLeft;
//启动
exe();
//初始选择难度界面的点击事件
function exe(){
    //难度选择
    var aP = oLevel.getElementsByTagName("p");
    for (var i = 0,length=aP.length; i < length; i++) {
        (function(i){
            aP[i].onclick = function (e) {
                e = e || window.event;
                startGame(i , {
                    x : e.clientX - boxOffsetLeft,
                    y : e.clientY - boxOffsetTop
                });//第一个实参为序号 ，第二个实参为存储着鼠标距离map边缘距离的json
            }
        })(i);
    }

    //restart按钮
    console.log(allReChild)
    allReChild[1].onclick = function (ev) {
        cancelAnimationFrame(oMap.bgTimer);//停止背景滚动
        oRe.style.display = "none";
        oLevel.style.display = "block";
        oScore.innerHTML = 0;
        oMap.innerHTML = "<div id='BiuAll'></div>";
        oBiuAll = document.getElementById("BiuAll");
        allBiu = oBiuAll.children;
    };
}

//开始游戏
function startGame(level , pos){
    clearMap(); //执行 隐藏和清理
    MapBg(level); //执行 Map背景相关操作
    var p = plane(level , pos); //执行 创建我军
    enemy(level , p); //执行 创建敌军
    //enemy(level , plane(level , pos));
    oBox.score = 0;//得分清零
}

//隐藏和清理
function clearMap(){
    oScore.style.display = "block";
    oLevel.style.display = "none";//隐藏关卡选择框
}

//Map背景选择与运动
function MapBg(level) {
    oMap.style.backgroundImage = "url('img/bg_"+(level+1)+".png')";

    (function m(){
        oMap.bgPosY = oMap.bgPosY || 0;
        oMap.bgPosY ++;
        oMap.style.backgroundPositionY = oMap.bgPosY + 'px';
        oMap.bgTimer = requestAnimationFrame(m);
    })();
}

//创建我军
function plane(level , pos) {
    //创建我军图片
    var oImg = new Image();//document.createElement("img");
    oImg.src = "img/myplane.png";
    oImg.width = 70;
    oImg.height = 70;
    oImg.className = "plane";
    oImg.style.left = pos.x - oImg.width/2 + 'px';
    oImg.style.top = pos.y - oImg.height/2 + 'px';
    oMap.appendChild(oImg);

    //边界值
    var leftMin = -oImg.width/2,
        leftMax = oMap.clientWidth - oImg.width/2,
        topMin = 0,
        topMax = oMap.clientHeight - oImg.height/2;

    //加入mousemove事件
    document.onmousemove = function (ev) {
        ev = ev || window.event;
        //获取飞机实时坐标，并限制边界值
        var left = ev.clientX - boxOffsetLeft - oImg.width/2;
        var top = ev.clientY - boxOffsetTop - oImg.height/2;
        left = Math.max(leftMin,left);
        left = Math.min(leftMax,left);
        top = Math.max(topMin,top);
        top = Math.min(topMax,top);
        //赋值
        oImg.style.left = left + 'px';
        oImg.style.top = top + 'px';
    };

    //调用子弹函数
    fire(oImg,level);

    return oImg;
}

//我军子弹
function fire(oImg , level){
    oBox.biuInterval = setInterval(function () {
        if ( oBox.score >= 500 ){
            createBiu(true , -1);
            createBiu(true , 1);
        }else{
            createBiu();
        }
    } , [200 , 300 , 200 , 150][level]);

    function createBiu(index , d){
        //创建子弹
        var oBiu = new Image();
        oBiu.src = "img/fire.png";
        oBiu.width = 100;
        oBiu.height = 100;
        oBiu.className = "biu";

        var left = oImg.offsetLeft + oImg.width/2 - oBiu.width/2;
        var top = oImg.offsetTop - oBiu.height + 5;

        if ( index ){
            left += oBiu.width*d
        }

        oBiu.style.left = left + "px";
        oBiu.style.top = top + 'px';


        oBiuAll.appendChild(oBiu);

        //子弹运动
        function m() {
            if ( oBiu.parentNode ){
                var top = oBiu.offsetTop - 20;
                if ( top < -oBiu.height ){
                    oBiuAll.removeChild(oBiu);
                }else{
                    oBiu.style.top = top + 'px';
                    requestAnimationFrame(m);
                }
            }
        }
        //将运动执行队列放后面，不然子弹会直接初始就在 top-50 的位置
        setTimeout(function(){
            requestAnimationFrame(m);
        },50);
    }
}

//创建敌军
function enemy(level , oPlane) {
    var w = oMap.clientWidth,
        h = oMap.clientHeight;

    var speed = [5,6,8,8][level]; //敌军下落速度

    var num = 1;
    oBox.enemyIntetval = setInterval(function () {
        var index = num%30?1:0;

        //生成敌军
        var oEnemy = new Image();
        oEnemy.index = index;
        oEnemy.HP = [20,1][index];
        oEnemy.speed = speed + (Math.random()*0.6 - 0.3)*speed;
        oEnemy.speed *= index?1:0.5;
        oEnemy.src = "img/enemy_"+["big","small"][index]+".png";
        oEnemy.className = "enemy";
        oEnemy.width = [104,84][index];
        oEnemy.height = [80,70][index];
        oEnemy.style.left = Math.random()*w - oEnemy.width/2 + 'px';
        oEnemy.style.top = -oEnemy.height + 'px';
        oMap.appendChild(oEnemy);
        num ++;

        //敌军运动
        function m(){
            if ( oEnemy.parentNode ){
                var top = oEnemy.offsetTop;
                top += oEnemy.speed;
                if ( top >= h ){
                    oBox.score --; //漏掉飞机减分
                    oScore.innerHTML = oBox.score;
                    oMap.removeChild(oEnemy);
                }else{
                    oEnemy.style.top = top + 'px';
                    //子弹碰撞检测
                    for (var i = allBiu.length - 1 ; i >= 0; i--) {
                        var objBiu = allBiu[i];
                        if ( coll(oEnemy , objBiu) ){
                            oBiuAll.removeChild(objBiu);//移除子弹
                            oEnemy.HP --;
                            if ( !oEnemy.HP ){
                                oBox.score += oEnemy.index?2:20; //打掉飞机加分
                                oScore.innerHTML = oBox.score;
                                boom(oEnemy.offsetLeft,oEnemy.offsetTop,oEnemy.width,oEnemy.height,index?0:2);//敌军爆炸图
                                oMap.removeChild(oEnemy);//移除敌军
                                return;
                            }
                        }
                    }
                    //我军碰撞检测
                    if ( oPlane.parentNode && coll(oEnemy,oPlane) ){
                        boom(oEnemy.offsetLeft,oEnemy.offsetTop,oEnemy.width,oEnemy.height,index?0:2);//敌军爆炸图
                        boom(oPlane.offsetLeft,oPlane.offsetTop,oPlane.width,oPlane.height,1);//我军爆炸图
                        oMap.removeChild(oEnemy);//移除敌军
                        oMap.removeChild(oPlane);//移除我军
                        GameOver();
                        return;
                    }
                    requestAnimationFrame(m);
                }
            }
        }
        requestAnimationFrame(m);
    },[350,150,120,40][level]);
}

//爆炸函数
function boom(l,t,w,h,i){
    var oBoom = new Image();
    oBoom.src = "img/"+["boom_small","myplane","boom_big"][i]+".png";
    oBoom.className = 'boom'+["","2",""][i];
    oBoom.width = w;
    oBoom.height = h;
    oBoom.style.left = l + "px";
    oBoom.style.top = t + 'px';
    oMap.appendChild(oBoom);
    setTimeout(function(){
        oBoom.parentNode && oMap.removeChild(oBoom);
    },[1200,2500,1200][i]);
}

//两个物体 碰撞检测
function coll( obj1 , obj2 ){
    var T1 = obj1.offsetTop,
        B1 = T1+obj1.clientHeight,
        L1 = obj1.offsetLeft,
        R1 = L1+obj1.clientWidth;

    var T2 = obj2.offsetTop,
        B2 = T2+obj2.clientHeight,
        L2 = obj2.offsetLeft,
        R2 = L2+obj2.clientWidth;

    return !( B1 < T2 || R1 < L2 || T1 > B2 || L1 > R2 );
}

//游戏结束
function GameOver(){
    document.onmousemove = null; //清除移动事件
    clearInterval(oBox.biuInterval);//不再产生新子弹
    clearInterval(oBox.enemyIntetval);//不再产生新敌军
    restart();
}

//结算+重新开始
function restart(){
    oScore.style.display = "none";
    var s = oBox.score;
    oRe.style.display = "block";
    allReChild[0].children[0].innerHTML = s;
    
}