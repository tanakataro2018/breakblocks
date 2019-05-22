let baseBlock = "<div class='baseBlock'></div>";
let redBlock = "<div class='redBlock'></div>";
let blueBlock = "<div class='blueBlock'></div>";
let greenBlock = "<div class='greenBlock'></div>";
let yellowBlock = "<div class='yellowBlock'></div>";
let cyanBlock = "<div class='cyanBlock'></div>";
let magentaBlock = "<div class='magentaBlock'></div>";

let blockArray = [];
blockArray[0] = redBlock;
blockArray[1] = blueBlock;
blockArray[2] = greenBlock;
blockArray[3] = yellowBlock;
blockArray[4] = cyanBlock;
blockArray[5] = magentaBlock;

// 描画しているゲームフィールド
let xyBlock = []; //8 cols 10rows

let downBlock = [];
downBlock[0] = [];
downBlock[1] = [];

// 一個前の保存されたゲームフィールド
let piledBlock = [];

let bottomLine = 9;
let rightLine = 7;

let timer = null;

let score = 0;
let speed = 1000;
let makeBlockCount = 0;
let accelarationCount = 0;

let waitTime = 100;
//let waitCount = 0;

// 初期実行
$("#scoreScreen").hide();
initialize();

// 盤面の初期化 ゲーム開始時に呼ぶ
function initialize(){
    // 縦横すべてベースのブロックを入れる
    for(let x = 0; x < 8; x++){
        xyBlock[x] = [];
        piledBlock[x] = [];
        for(let y = 0; y < 10; y++){
            xyBlock[x][y] = baseBlock;
            piledBlock[x][y] = baseBlock;
        }
    }

    score = 0;
    makeBlockCount = 0;
    accelarationCount = 0;
    speed = 1000;

    // 落ち始めるブロックの生成
    makeDownBlock();
    // 落ちブロックを描画用xy変数に入れ込む
    writeDownBlock();
    // 実際の表示を更新 ここでユーザがゲーム盤を認識する
    draw();
    setTimer();
}

function setTimer(){
    timer = setInterval("mainProcess()", speed);
}

function mainProcess(){
    //confirm game over
    if(gameover() == 0){
        return 0;
    }
    //confirm touch
    let touchParam = touchBlock();
    if(touchParam > 0){
        // 次の下のマスへ進めなかったときの処理がこのスコープ
        // 片方のブロックが次に進めなかったとき、もう片方のブロックを落ちるところまで落とす処理
        fallBlock(touchParam);
        copyPiledBlock();
        writeDownBlock();
        draw();

        clearInterval(timer);

        //waitCount = 0;
        // ブロックが落ちきって場所が確定した時点でブロックの削除を行う
        dltReWait(waitTime);

        // do{
        //     checkMovableBlock();
        // }while(deleteBlock());

        // saveBoard();

        // accelaration();
        // touchAfterProcess();

        // setTimer();
    }else{
        moveDownBlock();
        copyPiledBlock();
        writeDownBlock();
        draw();
    }
}

let dltReWait = function(milli_sec){
    let c = checkMovableBlock();
    let d = deleteBlock();
    if(c == 1 || d == 1){
        //waitCount++;
        let wrapFunc;
        wait(milli_sec, wrapFunc = function(){
            dltReWait(milli_sec);
        });
    }else{
        //if(waitCount == 0){
            saveBoard();
            accelaration();
            touchAfterProcess();
            setTimer();
        //}
    }
}

// sleep
function wait(milli_sec, functionSet) {
    setTimeout(function () {
        //waitCount--;
        functionSet();
        console.log(milli_sec + "ms停止");
    }, milli_sec);
}

function accelaration(){
    makeBlockCount++;
    if(makeBlockCount % 5 == 0 && 300 < speed){
        accelarationCount++;
        if(accelarationCount < 5){
            speed -= 20;
        }else if(4 <= accelarationCount && accelarationCount < 8){
            speed -= 10;
        }else{
            speed -= 5;
        }
    }
}

function touchAfterProcess(){
    if(gameover()){
        makeDownBlock();
        copyPiledBlock();
        writeDownBlock();
        draw();
    }
}

function checkMovableBlock(){
    let continueFlag = 0;
    let moveFlag = 0;
    do{
        continueFlag = 0;
        for(let i = bottomLine; i > 0; i--){
            for(let j = 0; j <= rightLine; j++){
                if(xyBlock[j][i] == baseBlock && xyBlock[j][i - 1] != baseBlock){
                    xyBlock[j][i] = xyBlock[j][i - 1];
                    xyBlock[j][i - 1] = baseBlock;
                    continueFlag++;
                    moveFlag = 1;
                }
            }
        }
        // console.log(continueFlag);
    }while(continueFlag);
    return moveFlag;
}

function gameover(opt){
    opt = opt || 0;
    if(piledBlock[3][0] != baseBlock || piledBlock[4][0] != baseBlock || opt == 1){
        clearInterval(timer);

        // let tryAgain = window.confirm("Your score: " + score + "\n" + "ゲームオーバーです。もう一度プレイしますか？");
        // if(tryAgain){
        //     initialize();
        //     makeDownBlock();
        //     draw();
        //     setTimer();
        // }

        $("#scoreNum").html("Your Score: <b>" + score + "</b><br>ゲームオーバーです。<br><br>");
        $("#message").html("<input class='retryButton' type='button' value='リトライ' onclick='answer(1);'><br><hr class='mgn-t-b'>");

        $("#ad").html("<a href='https://www.youtube.com/channel/UCKKKB5T2zwEcqA3pKiS09Kw'>tanaka taroのYoutubeチャンネルはこちら</a>");

        $("#main").hide();
        $("#scoreScreen").show();

        return 0;
    }
    return 1;
}

// 落ち始めるブロックの初期状態生成
function makeDownBlock(){
    //一個目
    downBlock[0]["x"] = 3;
    downBlock[0]["y"] = 0;
    downBlock[0]["color"] = blockArray[getRandomInt(5)];

    //二個目
    downBlock[1]["x"] = 4;
    downBlock[1]["y"] = 0;
    downBlock[1]["color"] = blockArray[getRandomInt(5)];
}

//落ちているブロックの位置と色を盤面の配列へコピー
function writeDownBlock(){
    xyBlock[downBlock[0]["x"]][downBlock[0]["y"]] = downBlock[0]["color"];
    xyBlock[downBlock[1]["x"]][downBlock[1]["y"]] = downBlock[1]["color"];
}

//状態が保存された配列から盤面用の配列に値をコピー
function copyPiledBlock(){
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 10; y++){
            xyBlock[x][y] = piledBlock[x][y]
        }
    }
}

//その時点でのxyBlockの内容で描画
function draw(){
    $("#game").html("");
    for(let y = 0; y < 10; y++){
        for(let x = 0; x < 8; x++){
            $("#game").append(xyBlock[x][y]);
        }
    }
    return 0;
}

function moveDownBlock(){
    downBlock[0]["y"]++;
    downBlock[1]["y"]++;
}

function fallBlock(touchParam){
    if(touchParam == 3 || touchParam == 4){
        // 両方移動できないケースはすぐリターン
        return 0;
    }

    // blockNumが0のとき左、1のとき右の操作をする
    // touchParamが1のとき、左が詰まっているため、右のを落としたい
    // そのため、touchParamが1のときblockNumは1、2のときは0のままとする
    let blockNum = 0; // 左ブロックのとき
    if(touchParam == 1){
        blockNum = 1; // 右ブロックのとき
    }

    let cnt = 0;
    for(let i = 1; i <= bottomLine - downBlock[blockNum]["y"]; i++){
        if(piledBlock[downBlock[blockNum]["x"]][downBlock[blockNum]["y"] + i] == baseBlock){
            cnt++;
        }
    }
    downBlock[blockNum]["y"] += cnt;
}

function deleteBlock(){
    let breakBrocks = [];

    for(let y = 0; y < 10; y++){
        for(let x = 0; x < 6; x++){
            // スキャンして横に3つ並んでいるところを見つける
            if(xyBlock[x][y] != baseBlock && xyBlock[x][y] ==  xyBlock[x + 1][y] && xyBlock[x][y] ==  xyBlock[x + 2][y]){
                let xyBreak = [];
                // 見つけたら座標を配列に格納
                for(let i = 0; i < 3; i++){
                    xyBreak[i] = [];
                    xyBreak[i][0] = x + i;
                    xyBreak[i][1] = y;
                }

                // スキャンで出てきたすべての座標をまとめる
                breakBrocks = breakBrocks.concat(xyBreak);
            }
        }
    }

    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            // スキャンして横に3つ並んでいるところを見つける
            if(xyBlock[x][y] != baseBlock && xyBlock[x][y] ==  xyBlock[x][y + 1] && xyBlock[x][y] ==  xyBlock[x][y + 2]){
                let xyBreak = [];
                // 見つけたら座標を配列に格納
                for(let i = 0; i < 3; i++){
                    xyBreak[i] = [];
                    xyBreak[i][0] = x;
                    xyBreak[i][1] = y + i;
                }

                // スキャンで出てきたすべての座標をまとめる
                breakBrocks = breakBrocks.concat(xyBreak);
            }
        }
    }

    // 実際のデリート処理、ベースブロックに戻すだけ
    if(breakBrocks.length > 1){
        breakBrock(breakBrocks);
        return true;
    }else{
        return false;
    }
}

function breakBrock(breakBrocks){
    for(let i = 0; i < breakBrocks.length; i++){
        xyBlock[breakBrocks[i][0]][breakBrocks[i][1]] = baseBlock;
        score += 100;
    }
}

// iOS の偽装で実行すると、ボタン連打が反応しない PCはOKなので、スクリプトに問題はない
function ButtonTap(slideNum){
    copyPiledBlock();
    if(touchSide(slideNum)){
        downBlock[0]["x"] = downBlock[0]["x"] + slideNum;
        downBlock[1]["x"] = downBlock[1]["x"] + slideNum;
    }
    writeDownBlock();
    draw();
}

function　FallButton(){
    for(let i = 1; i < 10; i++){
        if(piledBlock[downBlock[0]["x"]][downBlock[0]["y"] + i] != baseBlock || piledBlock[downBlock[1]["x"]][downBlock[1]["y"] + i] != baseBlock){
            copyPiledBlock();
            downBlock[0]["y"] += i - 1;
            downBlock[1]["y"] += i - 1;
            writeDownBlock();
            draw();
            break;
        }
    }
}

//接触したらパラメータ値 次に進んで大丈夫なときは0
function touchBlock(){
    let param = 0;
    if(downBlock[0]["y"] < bottomLine && downBlock[1]["y"] < bottomLine){    
        if(piledBlock[downBlock[0]["x"]][downBlock[0]["y"] + 1] != baseBlock){
            param += 1;
        }
        if(piledBlock[downBlock[1]["x"]][downBlock[1]["y"] + 1] != baseBlock){
            param += 2;
        }
    }else{
        // 底付き
        param = 4;
    }

    // 0のとき接触なし、1のとき左だけ接触、2のとき右だけ接触、3のとき両方接触、4は底付き
    return param;
}

function touchSide(slideNum){
    if(slideNum > 0){
        // 右側のブロック　＋　１　がベースブロックでないときは移動させられないのでFalse
        // 右端の壁にぶつかったときも、移動させられないのでFalse
        if(downBlock[1]["x"] + slideNum > rightLine || piledBlock[downBlock[1]["x"] + slideNum][downBlock[0]["y"]] != baseBlock){
            return 0;
        }
    }else{
        if(downBlock[0]["x"] + slideNum < 0 || piledBlock[downBlock[0]["x"] + slideNum][downBlock[0]["y"]] != baseBlock){
            return 0;
        }
    }
    return 1;
}

function saveBoard(){
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 10; y++){
            piledBlock[x][y] = xyBlock[x][y];
        }
    }
}

function answer(ans){
    if(ans == 1){
        $("#main").show();
        $("#scoreScreen").hide();
        initialize();
    }else{
        return 0;
    }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// 拡大縮小を止める
document.documentElement.addEventListener('touchstart', function (e) {
    if (e.touches.length >= 2) { e.preventDefault(); }
}, { passive: false });

// ダブルタップでの拡大停止
let t = 0;
document.documentElement.addEventListener('touchend', function (e) {
    let now = new Date().getTime();
    if ((now - t) < 350) {
        e.preventDefault();
    }
    t = now;
}, false);
/// 拡大縮小止めここまで

