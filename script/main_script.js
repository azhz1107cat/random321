// 定义全局变量
let g_peopleData = JSON.parse( localStorage.getItem("people") ) || ['张三','李四','王五'];
$('.make-inputs-from-storage').prop('disabled', g_peopleData.length === 0);

let g_peopleList = [];

let g_peopleNumberToCall = 1;
let g_groupNumber = 1;
let g_PeopleCanRepeat = false;
let g_UseSafe = false;
let g_autoSaveList = true;
let g_nowIsTheCallMethod = JSON.parse( localStorage.getItem("callmethod") ) || 2;

g_peopleData.forEach(element => addInput(element))

$(".callmian").children().eq(g_nowIsTheCallMethod).show();

let getRandom16Dec = g_UseSafe ? safeModel : unSafeModel;

function rhStart(){
    let span = $("<span></span>");
    let tempInputlist = g_peopleList.map((element)=>{
        return $(element).children().first().val();
    })
    for(let i = 0;i < tempInputlist.length ; i++){
        span.text(tempInputlist [ Math.floor( getRandom16Dec() * tempInputlist.length )])
        showResultMain.append(span);
    }

}

function callPeople() {
    // 开始抽签
    let randomResult = [];
    const numToCallPeople = g_groupNumber * g_peopleNumberToCall;

    let tempInputlist = g_peopleList.map((element)=>{
        return $(element).children().first().val();
    })

    for (let i = 0; i < numToCallPeople; i++) {
        randomResult.push(tempInputlist [ Math.floor( getRandom16Dec() * tempInputlist.length )]);
    }

    return randomResult;
}


function addInput(inputValue = "") {
    // 添加input框
    const wholeInputDiv = $("<div class='input-div'></div>");
    const singleInput = $("<input type='text'/>");
    const removeInput = $('<button class="remove-input"><img src="styles/FontAwesome/xmark-solid.svg" width="32" height="32"/>删除</button>');

    singleInput.val(inputValue);
    singleInput.appendTo(wholeInputDiv);
    removeInput.appendTo(wholeInputDiv);
    wholeInputDiv.appendTo($(".show-inputs"));

    g_peopleList.push(wholeInputDiv[0]);
}

function showRandomReslut(list) {
    // 展示抽取结果
    const showResultMain = $(".put-result-main");

    list.forEach((element) => {
        showResultMain.append(element+"<br/>")
    })
    showResultMain.append("<hr/>")
}

let currentRotation = 0; // 转盘当前旋转角度
let targetRotation = 0; // 目标旋转角度
let isSpinning = false; // 防止重复触发

// 初始化画布（分离指针绘制）
function initCanvas() {
    const canvas = $("canvas")[0];
    canvas.width = 600;
    canvas.height = 600;
    drawPointer(); // 单独绘制固定指针
}

// 单独绘制固定指针
// 修改后的绘制指针函数（直线版）
function drawPointer() {
    const canvas = $("canvas")[0];
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.beginPath();
    // 绘制垂直线条指针（从中心向上延伸）
    ctx.moveTo(centerX, centerY - 40); // 起点：中心上方40px
    ctx.lineTo(centerX, centerY - 250); // 终点：中心上方250px（更长线条）
    
    // 设置线条样式
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3; // 加粗线条
    ctx.lineCap = 'round'; // 圆角端点
    ctx.stroke();

    // 添加底部小圆点（可选装饰）
    ctx.beginPath();
    ctx.arc(centerX, centerY - 40, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
}

// 其他函数保持不变（initCanvas、drawWheel、spin等）

// 修改后的绘制转盘（只绘制转盘部分）
function drawWheel(list) {
    const canvas = $("canvas")[0];
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 250;
    const singleCount = list.length;
    const singleAngle = (2 * Math.PI) / singleCount;

    // 保存原始画布状态
    ctx.save();
    
    // 应用旋转到转盘
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);
    ctx.translate(-centerX, -centerY);

    // 绘制扇形（原逻辑）
    list.forEach((item, i) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(i * singleAngle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, 0, singleAngle);
        ctx.fillStyle = `hsl(${(i * 360)/singleCount}deg, 70%, 60%)`;
        ctx.fill();

        ctx.rotate(singleAngle/2);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item, radius/2 + 20, 5);
        ctx.restore();
    });

    ctx.restore(); // 恢复画布原始状态
    drawPointer();  // 重新绘制固定指针
}

// 修改后的旋转逻辑
function spin(list, onComplete) {
    if (isSpinning) return;
    isSpinning = true;
    
    // 计算随机旋转圈数（至少3圈）
    const baseRotation = Math.PI * 2 * 3; 
    const randomAddition = Math.PI * 2 * Math.random();
    targetRotation += baseRotation + randomAddition;

    function animate() {
        // 缓动动画公式
        currentRotation += (targetRotation - currentRotation) * 0.05;
        drawWheel(list);

        if (Math.abs(targetRotation - currentRotation) > 0.01) {
            requestAnimationFrame(animate);
        } else {
            // 动画结束时计算最终结果
            isSpinning = false;
            const finalAngle = (currentRotation % (Math.PI * 2)) + Math.PI/2; // +90度偏移
            const itemIndex = Math.floor((finalAngle / (Math.PI * 2)) * list.length) % list.length;
            
            // 返回实际索引（考虑顺时针旋转需反转）
            const resultIndex = list.length - 1 - itemIndex;
            onComplete?.(list[resultIndex]);
        }
    }
    
    requestAnimationFrame(animate);
}

/* 使用示例 */
initCanvas();

//======================================================================
// 主体
$(document).ready(function () {

    if ($(".show-inputs").children().length >= 10e15) {
        // 没什么用的检查
        page_infoWindow("注意", "人数过多");
    }

    $(document).on("click", ".start", function () {
        let tempInputlist = g_peopleList.map((element)=>{
            return $(element).children().first().val();
        })
        // 开始抽签事件
        let numberToCall = $(".get-number-to-call").val();
        numberToCall = parseInt(numberToCall);

        if (numberToCall == null|| numberToCall == "" ) {
            page_infoWindow("错误", "输入框 不能为空");
            return;
        } else if (typeof numberToCall != 'number') {
            page_infoWindow("错误", "请检查 抽取人数与 组数，它们必须是数字");
            return;
        } else if (!Number.isInteger(numberToCall)) {
            page_infoWindow("错误", "请检查 抽取人数与 组数 使其为整数");
            return;
        } else if ( numberToCall < 1) {
            page_infoWindow("错误", "当前不可分组");
            return;
        }
        
        if (g_peopleList.length < 1) {
            page_infoWindow("错误", "人员 大于 1 时才可抽取");
            return;
        }

        if(g_nowIsTheCallMethod === 0) showRandomReslut(callPeople());
        else if(g_nowIsTheCallMethod === 1) rhStart();
        else if(g_nowIsTheCallMethod === 2){
            spin(tempInputlist, (result) => {
                page_infoWindow("指针指向：" , result);
            });
        };
    });

    $(document).on("click", ".change-call-mtd", function(){
        // 切换抽取方式
        if (g_nowIsTheCallMethod === 2) {
            g_nowIsTheCallMethod = 0;
        } else {
            g_nowIsTheCallMethod++;
        }
        $(".callmian").children().eq(g_nowIsTheCallMethod - 1).hide();
        $(".callmian").children().eq(g_nowIsTheCallMethod).show();
        localStorage.setItem('callmethod', JSON.stringify(g_nowIsTheCallMethod));
    })
    $(document).on("click", ".open-about", function(){
        // 打开关于窗口
        $(".about-window").css("display", "flex");
    })

    $(document).on("click", ".open-logging", function(){
        // 打开日志窗口
        $(".logging-window").css("display", "flex");
    })

    $(document).on("click", ".open-inputs", function () {
        // 打开inputs窗口
        $(".inputs-window").css("display", "flex");
    });

    $(document).on("click", ".window-close", function () {
        // 关闭窗口
        $(this).parent().parent().parent().hide();
    });

    $(document).on("click", ".inputs-window .window-enter", function () {
        // 完成input-window
        $(".num-to-catch").text(g_peopleList.length);
        let tempInputlist = g_peopleList.map(element=> {
            return $(element).children().first().val()
        });
        localStorage.setItem('people', JSON.stringify(tempInputlist));
        $(this).parent().parent().parent().hide();
        // 绘制大转盘
        initCanvas();
        drawWheel(tempInputlist);
    });

    $(document).on("click", ".make-inputs-from-file-onload", function () {
        // 打开文件上传界面
        $('#fileInput').click();
    });

    $(document).on("click", ".reset", function () {
        // 开启新一轮抽取;
    });

    $(document).on("change", '#fileInput', function () {
        // 从文件添加input框事件
        const file = $('#fileInput')[0].files[0];
        if (!file) {
            page_infoWindow("错误", "没有文件");
            return;
        }

        getXlsxHeaders(file).then(async headers => {
            outputContentIn(file,await page_chooseBox('','','',headers)).then((result) => {
                result.forEach( element =>{
                    addInput(element)
                }) 
            })
            .catch(error => {
                page_infoWindow('错误:', error.message);
              });
        }).catch(error => {
            page_infoWindow(error);
        });

        $(this).val(null)
    })  

    $(document).on("click", ".make-inputs-from-text", async function () {
        // 从文本添加input框事件
        let textareaBoxText = await page_textareaBox("输入文本以转换为人员名单","输入文本以转换为人员名单");
        if (textareaBoxText !== "") {
            if (textareaBoxText.endsWith('\n')) {
                textareaBoxText = textareaBoxText.slice(0, -1);
            }
            let tbox_toList = textareaBoxText.split("\n");
            tbox_toList.forEach((element) => {
                addInput(element);
            });
        }
    });

    $(document).on("click", ".make-inputs-from-storage", function () {
        // 从本地储存添加input框事件
        g_peopleData.forEach((element) => {
            addInput(element);
        });
    });

    $(document).on("click", ".make-new-input", function () {
        // 添加input框事件
        addInput();
    });

    $(document).on("click", ".clean-all-inputs", async function () {
        // 清空input框事件
        if (await page_askWindow("重要", "是否删除")) {
            g_peopleList.length = 0;
            $(".show-inputs").empty();
        }
    });

    $(document).on("click", ".remove-input", function () {
        // 删除input框事件
        const parentElement = $(this).parent()[0];
        $(parentElement).remove();
        let parentElementIndex = g_peopleList.indexOf(parentElement);
        if (parentElementIndex !== -1) { 
            g_peopleList.splice(parentElementIndex, 1) 
        }

    });

    $(".inputs-window-enter").click()
})