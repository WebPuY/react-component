## SearchPageContent组件

### 参数列表

参数 | 类型 | 说明 | 默认值
---|---|---|---
formItems | array | 表单选项配置|[]
useResetButton | boolean | 是否使用表单清空按钮 | false
visibleItemLimits | number | 表单初始最多展示多少项，超出折叠|12
dataSourceUrl|string|table数据源|""
tableHeader|array|table表头配置|[]
usePagination|boolean|是否显示分页|true
tableBtnsArr|array|table左上角按钮配置|[]
useTableFilter|boolean|是否使用表格筛选组件|false
usePageSizeChanger|boolean|是否使用动态切换每页条数组件|false
useQuickJumper|boolean|是否使用快速跳页组件|true
defaultPageSize|number|默认每页条数|10
handleTableItemChecked|function|表格行选中事件回调

### formItems配置说明

参数 | 类型 | 说明 
---|---|---
type|string|控件类型，目前支持：input, select, datePicker, position, rangePicker, cascader, airline
formkey|string|控件再表单序列化提交时对应的key
label|string|控件前面的label文案
props|object|控件的属性，placeholder等
config|object|antd表单组件getFieldDecorator配置，参考antd文档
dataSourceUrl|string|业务组件专有属性，组件数据源url

#### example
``` bash
const formItems = [{
    type: 'input',
    formKey: 'name',
    label: 'name',
    props: {
      placeholder: 'your name'
    },
    config: {
      rules: [
        {
          required: true,
          message: 'plz input'
        }
      ]
    }
}]
```
