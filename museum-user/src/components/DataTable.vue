<template>
  <div class="data-table">
    <!-- 表格工具栏 -->
    <div v-if="title || $slots.toolbar" class="table-toolbar">
      <div v-if="title" class="table-title">{{ title }}</div>
      <div class="toolbar-actions">
        <slot name="toolbar"></slot>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <el-table
      v-bind="$attrs"
      :data="data"
      :border="border"
      :stripe="stripe"
      v-loading="loading"
      :height="height"
      :max-height="maxHeight"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选框 -->
      <el-table-column 
        v-if="selection" 
        type="selection" 
        width="55"
      />
      
      <!-- 索引列 -->
      <el-table-column 
        v-if="index" 
        type="index" 
        label="序号" 
        width="60" 
        align="center"
      />
      
      <!-- 表格列 -->
      <slot></slot>
      
      <!-- 操作列 -->
      <el-table-column 
        v-if="$slots.operation" 
        :label="operationLabel" 
        :width="operationWidth" 
        :fixed="operationFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="operation" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <div v-if="pagination" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 表格标题
  title: {
    type: String,
    default: ''
  },
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否带边框
  border: {
    type: Boolean,
    default: true
  },
  // 是否带斑马纹
  stripe: {
    type: Boolean,
    default: true
  },
  // 是否显示多选框
  selection: {
    type: Boolean,
    default: false
  },
  // 是否显示索引列
  index: {
    type: Boolean,
    default: false
  },
  // 操作列标题
  operationLabel: {
    type: String,
    default: '操作'
  },
  // 操作列宽度
  operationWidth: {
    type: [String, Number],
    default: 'auto'
  },
  // 操作列是否固定
  operationFixed: {
    type: [String, Boolean],
    default: false
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: null
  },
  // 表格最大高度
  maxHeight: {
    type: [String, Number],
    default: null
  },
  // 是否显示分页
  pagination: {
    type: Boolean,
    default: true
  },
  // 当前页
  page: {
    type: Number,
    default: 1
  },
  // 每页条数
  limit: {
    type: Number,
    default: 10
  },
  // 可选的每页条数
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50]
  },
  // 总数
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'page-change', 'size-change', 'selection-change'])

// 当前页数和每页数量
const currentPage = ref(props.page)
const pageSize = ref(props.limit)

// 监听props变化
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.limit, (val) => {
  pageSize.value = val
})

// 页码改变事件
const handleCurrentChange = (page) => {
  emit('update:page', page)
  emit('page-change', { page, limit: pageSize.value })
}

// 每页条数改变事件
const handleSizeChange = (limit) => {
  emit('update:limit', limit)
  emit('size-change', { page: currentPage.value, limit })
}

// 多选改变事件
const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}
</script>

<style lang="scss" scoped>
.data-table {
  width: 100%;
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .table-title {
      font-size: 16px;
      font-weight: 600;
    }
    
    .toolbar-actions {
      display: flex;
      gap: 10px;
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style> 