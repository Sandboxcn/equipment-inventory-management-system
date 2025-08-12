import Papa from 'papaparse';
import { RawCSVRow, Device, Component, ValidationResult } from '../types';

export class CSVParser {
  /**
   * 解析CSV文件
   */
  async parseFile(file: File): Promise<RawCSVRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: false, // 保留空行用于处理继承逻辑
        encoding: 'UTF-8',
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV解析错误: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data as RawCSVRow[]);
          }
        },
        error: (error) => {
          reject(new Error(`文件读取错误: ${error.message}`));
        }
      });
    });
  }

  /**
   * 处理空行继承逻辑
   * 设备编号和工作部位列中，只有第一行有值，后续空行都属于该设备/工作部位
   */
  processInheritance(rows: RawCSVRow[]): Device[] {
    const devices: Device[] = [];
    let currentDevice: Device | null = null;
    let deviceCounter = 1;
    let componentCounter = 1;

    // 过滤掉完全空的行和标题行
    const validRows = rows.filter(row => {
      const hasContent = Object.values(row).some(value => 
        value && value.toString().trim() !== ''
      );
      // 跳过标题行（包含"设备编号"等字段名的行）
      const isHeaderRow = row.设备编号 === '设备编号' || 
                         row.零部件名称 === '零部件名称';
      return hasContent && !isHeaderRow;
    });

    for (const row of validRows) {
      // 检查是否是新设备（设备编号不为空）
      if (row.设备编号 && row.设备编号.trim() !== '') {
        // 保存当前设备
        if (currentDevice) {
          devices.push(currentDevice);
        }

        // 创建新设备
        currentDevice = {
          id: `device-${deviceCounter++}`,
          设备编号: row.设备编号.trim(),
          工作部位: row.工作部位?.trim() || '',
          零部件列表: []
        };
      }

      // 如果有零部件名称，添加零部件
      if (row.零部件名称 && row.零部件名称.trim() !== '' && currentDevice) {
        const component: Component = {
          id: `component-${componentCounter++}`,
          零部件名称: row.零部件名称.trim(),
          型号规格: row.型号规格?.trim() || '',
          数量及米数: row.数量及米数?.trim() || '',
          电机功率: row.电机功率?.trim() || '',
          备注: row.备注?.trim() || ''
        };
        currentDevice.零部件列表.push(component);
      }
    }

    // 添加最后一个设备
    if (currentDevice) {
      devices.push(currentDevice);
    }

    return devices;
  }

  /**
   * 数据验证
   */
  validateData(rows: RawCSVRow[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rows || rows.length === 0) {
      errors.push('CSV文件为空或无有效数据');
      return { isValid: false, errors, warnings };
    }

    // 检查必要的列是否存在
    const requiredColumns = ['设备编号', '工作部位', '零部件名称', '型号规格', '数量及米数', '电机功率', '备注'];
    const firstRow = rows[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      errors.push(`缺少必要的列: ${missingColumns.join(', ')}`);
    }

    // 检查数据完整性
    let deviceCount = 0;
    let componentCount = 0;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // 跳过标题行
      if (row.设备编号 === '设备编号') continue;
      
      // 统计设备和零部件数量
      if (row.设备编号 && row.设备编号.trim() !== '') {
        deviceCount++;
      }
      
      if (row.零部件名称 && row.零部件名称.trim() !== '') {
        componentCount++;
      }
    }

    if (deviceCount === 0) {
      errors.push('未找到有效的设备数据');
    }

    if (componentCount === 0) {
      warnings.push('未找到零部件数据');
    }

    // 检查电机功率格式
    const powerPattern = /^\d*\.?\d*(kw|KW|千瓦)?$/i;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.电机功率 && row.电机功率.trim() !== '') {
        const power = row.电机功率.trim();
        if (!powerPattern.test(power)) {
          warnings.push(`第${i + 1}行电机功率格式可能不正确: ${power}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 生成示例CSV数据
   */
  generateSampleData(): string {
    const sampleData = [
      ['设备编号', '工作部位', '零部件名称', '型号规格', '数量及米数', '电机功率', '备注'],
      ['HC-001', '1#真空回潮机', '密封圈', '型号或图号：NJBφ65', '2', '', '气动球阀用'],
      ['', '', '密封圈', '型号或图号：NJBφ100', '1', '', '气动球阀用'],
      ['', '', '加湿电磁阀', 'SMC 型号或图号：VXD2260-10-5DZL', '1', '', '加潮'],
      ['HC-002', '1#西门电机', '减速机电机', 'RF37 DT71D4/BMG/HF', '1', '0.37KW', ''],
      ['', '', '气缸', 'SMC MBB100-50 Pmax=1.0Mpa', '4', '', '']
    ];

    return sampleData.map(row => row.join(',')).join('\n');
  }
}

export const csvParser = new CSVParser();