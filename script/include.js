// 抽签方式
function unSafeModel() {
    return Number(Math.random().toFixed(16));
}

function safeModel() {
    const num16array = new Uint32Array(1);
    crypto.getRandomValues(num16array);
    const randomFraction = num16array[0] / Math.pow(2, 32);
    return Number(randomFraction.toFixed(16));
}

function getXlsxHeaders(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // 使用 sheet_to_json 获取二维数组（包含表头）
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,   // 输出二维数组
                    defval: ""    // 空单元格默认值为空字符串
                });

                if (jsonData.length === 0) throw new Error("工作表为空");
                const headers = jsonData[0];

                // 处理合并单元格逻辑
                const merges = worksheet['!merges'] || [];
                for (const merge of merges) {
                    const s = merge.s; // 合并起始单元格
                    const e = merge.e; // 合并结束单元格
                    
                    // 仅处理涉及表头行（第0行）的合并
                    if (s.r > 0 || e.r < 0) continue;

                    // 获取合并主单元格的值
                    const mainValue = headers[s.c] || "";
                    
                    // 填充被合并的列（表头行）
                    for (let col = s.c; col <= e.c; col++) {
                        headers[col] = mainValue;
                    }
                }

                resolve(headers);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject("读取文件时出错");
        };

        reader.readAsArrayBuffer(file);
    });
}

function outputContentIn(file, header) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 获取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 将工作表转换为二维数组（包含表头）
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // 检查数据是否为空
          if (jsonData.length === 0) {
            throw new Error('Excel 文件为空');
          }
          
          // 提取表头行并查找目标列的索引
          const headers = jsonData[0];
          const columnIndex = headers.indexOf(header);
          
          if (columnIndex === -1) {
            throw new Error(`未找到表头 "${header}"`);
          }
          
          // 收集该列的所有数据（排除表头行）
          const result = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            result.push(row[columnIndex] ?? null); // 处理空单元格
          }
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
  
      reader.readAsArrayBuffer(file);
    });
  }