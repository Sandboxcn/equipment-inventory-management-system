// 原始CSV行数据
export interface RawCSVRow {
  设备编号: string;
  工作部位: string;
  零部件名称: string;
  型号规格: string;
  数量及米数: string;
  电机功率: string;
  备注: string;
}

// 零部件数据
export interface Component {
  id: string;
  零部件名称: string;
  型号规格: string;
  数量及米数: string;
  电机功率: string;
  备注: string;
}

// 处理后的设备数据
export interface Device {
  id: string;
  设备编号: string;
  工作部位: string;
  零部件列表: Component[];
}

// 统计数据
export interface Statistics {
  设备总数: number;
  零部件总数: number;
  电机功率汇总: number;
  设备分类统计: Record<string, number>;
  零部件分类统计: Record<string, number>;
}

// 数据验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 筛选选项
export interface FilterOptions {
  设备编号?: string;
  工作部位?: string;
  零部件名称?: string;
  型号规格?: string;
}

// 排序选项
export interface SortOptions {
  field: keyof Device | keyof Component;
  direction: 'asc' | 'desc';
}

// 分页选项
export interface PaginationOptions {
  page: number;
  pageSize: number;
  total: number;
}

// 图表数据类型
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// 应用状态
export interface AppState {
  devices: Device[];
  statistics: Statistics | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  filters: FilterOptions;
  sortOptions: SortOptions | null;
}