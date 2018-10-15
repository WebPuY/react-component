import React from 'react';
import PropTypes from 'prop-types';
import {Button, Table, Popover} from 'antd';
import TableFilter from '../TableFilter';
import './index.scss';
// import filterIcon from './filterIcon.png';

// 限定属性种类。
function filterKeys(object) {
  const itemKeys = Object.keys(object);
  const Keys = ['title', 'dataIndex', 'sorter', 'render', 'key', 'filters', 'colSpan', 'width'];
  const result = {};
  Keys.forEach((item) => {
    if (itemKeys.indexOf(item) >= 0) {
      result[item] = object[item];
    }
  });
  return result;
}

export default class ListTable extends React.Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired, // onchange函数，必须，可以传出table组件的相关内容，包括页码信息、筛选信息、排序信息
    pagination: PropTypes.bool.isRequired, // 是否需要页码，必须
    tableHeader: PropTypes.array.isRequired, // 表头信息，必须,每一项中必须有key和title两项。
    tableBody: PropTypes.array.isRequired, // 内容信息，必须
    showTableFilter: PropTypes.bool.isRequired, // 如果这个参数是true，则table右上角回出现一个筛选组件，来筛选表头
    filterItemsArr: PropTypes.array.isRequired, // filter组件用的数组
    filtTableHeader: PropTypes.func,    // 表头筛选组件传回父组件数组，如果showTableFilter是true，则这个方法必传
    showSizeChanger: PropTypes.bool,    // 翻页是否改变每页条数
    showQuickJumper: PropTypes.bool,    // 是否快速跳到某页
    defaultPageSize: PropTypes.number,  // 默认每页条数
    total: PropTypes.number,            // 翻页总数量
    currentPage: PropTypes.number,      // 当前页码
    originalTableHeader: PropTypes.array, // 最初是的表头，用于reset函数，保证最原始的表头恢复。
    rowKey: PropTypes.string, // 制定的key,用来替换默认的'key'
    getSelectedItemsFunction: PropTypes.func.isRequired, // 如果有选择功能，则选择之后需要执行的函数
    isNoCheckedTable: PropTypes.bool.isRequired, // 是否需要选择功能,true-没有选择功能，FALSE-有选择功能
    renderBtnsArr: PropTypes.array, // 左侧操作按钮的描述数组
    renderRightBtnsArr: PropTypes.array, // 右侧操作按钮的描述数组
    rowSelection: PropTypes.shape({}), // 列表rowSelection项
    tableClassName: PropTypes.string // tabled的classname
  };
  state = {
    pagination: !this.props.pagination ? this.props.pagination : {
      showSizeChanger: this.props.showSizeChanger ? this.props.showSizeChanger : false,
      showQuickJumper: this.props.showQuickJumper ? this.props.showQuickJumper : false,
      currentPage: this.props.showQuickJumper ? this.props.showQuickJumper : 1,
      defaultPageSize:
      Number(window.localStorage.getItem(location.hostname + location.pathname + '_pagenation_size')) ||
      this.props.defaultPageSize || 10,
      total: this.props.total,
      onShowSizeChange: (current, size) => {
        window.localStorage.setItem(location.hostname + location.pathname + '_pagenation_size', size);
      }
    },
    selectedRowKeys: [],              // 这个是页面上现有的选中列表的id
    tableFilterVisible: false         // 控制表格右上角筛选组件
  };

  // 暴露一个方法重置列表项勾选状态
  publicReset() {
    this.setState({selectedRowKeys: []});
  }

  componentWillReceiveProps(nextProps) {

    this.setState({
      pagination: !nextProps.pagination ? nextProps.pagination : {
        showSizeChanger: nextProps.showSizeChanger,
        showQuickJumper: nextProps.showQuickJumper,
        defaultPageSize: nextProps.defaultPageSize,
        current: nextProps.currentPage,
        total: nextProps.total
      }
    });
  }

  // 表格中选中一行之后需要执行的函数。
  onSelectChange = (selectedRowKeys, selectedRowData) => {
    this.setState({
      selectedRowKeys
    });
    this.props.getSelectedItemsFunction(selectedRowKeys, selectedRowData);
  };

  // 翻页／排序等的回调方法
  onListTableChange(pagination, filters, sorter) {
    this.props.onChange(pagination, filters, sorter);
    this.setState({
      selectedRowKeys: []
    });
  }

  // 接收TableFilter组件输出的数组
  getTableFilterArr(arrayData) {
    this.props.filtTableHeader(arrayData);
    this.setState({
      tableFilterVisible: false
    });
  }

  setRowClassName(item) {
    return item.fe_ex_row_error ? 'redRow' : '';
  }

  // 右上角filter是否显示
  handleFilterVisibleChange(flag) {
    this.setState({
      tableFilterVisible: flag
    });
  }

  // 根据传下来的数组，来渲染buttons
  renderButtons(renderBtnsArr, isLeftbtn) {
    const selectedRowKeysLen = !this.state.selectedRowKeys.length;
    return renderBtnsArr.map((item, index) => {
      return (
        <a key={index} href={item.to} target={item.target || ''}>
          <Button
            disabled={selectedRowKeysLen && isLeftbtn}
            size={item.size || 'normal'}
            type={item.type}
            className="optionBtn"
            onClick={item.handleItemClick}
          >
            {
              item.btnText
            }
          </Button>
        </a>
      );
    });
  }

  // 根据showTableFilter标识，来判断是否渲染表头的TableFilter组件
  renderTableFilter(tableHeader) {
    const filterItemsArr = this.props.filterItemsArr;
    const filterHeader = filterItemsArr.map((items) => {
      return {
        value: items.key,
        label: items.title,
        checked: items.checked,
        disabled: items.connotChecked ? items.connotChecked : false
      };
    });
    const content = (
      <TableFilter
        tableHeader={tableHeader}
        originalTableHeader={this.props.originalTableHeader}
        filterHeader={filterHeader}
        getTableFilterArr={array => this.getTableFilterArr(array)}
      />
    );
    const tableFilterVisible = this.state.tableFilterVisible;
    return (
      <Popover
        content={content}
        trigger="click"
        placement="bottomRight"
        visible={tableFilterVisible}
        onVisibleChange={flag => this.handleFilterVisibleChange(flag)}
        getPopupContainer={() => document.getElementById('tableFilter')}
      >
        <p className="filterText">
          {/* <img className="filterIcon} src={filterIcon} alt="Filter"/> */}
          Filter
        </p>
      </Popover>
    );
  }

  render() {
    const {tableHeader, tableBody, showTableFilter} = this.props;
    console.log(tableHeader, 'tableHeader');
    const {pagination} = this.state;
    // 遍历tableHeader 找出需要的属性
    const newTableHeader = [];
    tableHeader.forEach((item) => {
      newTableHeader.push(filterKeys(item));
    });
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.onSelectChange.bind(this),
      ...this.props.rowSelection
    };
    const buttons = this.renderButtons(this.props.renderBtnsArr, true);
    let rightButtons = [];
    if (this.props.renderRightBtnsArr && this.props.renderRightBtnsArr.length > 0) {
      // 区分判断是普通描述对象还是Reactnode
      if (this.props.renderRightBtnsArr[0].btnText) {
        rightButtons = this.renderButtons(this.props.renderRightBtnsArr, false);
      } else {
        rightButtons = this.props.renderRightBtnsArr;
      }
    }
    // isNoCheckedTable,判断是否有选中行功能
    if (this.props.isNoCheckedTable) {
      return (
        <div className="tableWrap">
          <div className="optionBtns">
            {buttons}
          </div>
          {/* <div className={classnames({[style.optionRightBtnsHasFilter]: showTableFilter, [style.tableFilter]: true})}>
            {rightButtons}
          </div> */}
          <div className="tableFilter" id="tableFilter">
            {
              showTableFilter ? this.renderTableFilter(tableHeader) : null
            }
          </div>
          <Table
            onChange={(paginations, filters, sorter) => this.onListTableChange(paginations, filters, sorter)}
            className={this.props.tableClassName}
            columns={newTableHeader}
            dataSource={tableBody}
            pagination={pagination}
            rowClassName={this.setRowClassName}
            rowKey={this.props.rowKey}
            bordered={true}
          />
        </div>
      );
    } else {
      return (
        <div className="tableWrap">
          <div className="optionBtns">
            {buttons}
          </div>
          {/* <div className={classnames({[style.optionRightBtnsHasFilter]: showTableFilter, [style.tableFilter]: true})}>
            {rightButtons}
          </div> */}
          <div className="tableFilter" id="tableFilter">
            {
              showTableFilter ? this.renderTableFilter(tableHeader) : null
            }
          </div>
          <Table
            onChange={(paginations, filters, sorter) => this.onListTableChange(paginations, filters, sorter)}
            className={this.props.tableClassName}
            rowSelection={rowSelection}
            columns={newTableHeader}
            dataSource={tableBody}
            pagination={pagination}
            rowClassName={this.setRowClassName}
            rowKey={this.props.rowKey}
            bordered={true}
          />
        </div>
      );
    }
  }

}
