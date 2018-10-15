import React from 'react';
import PropTypes from 'prop-types';
import SearchForm from '../SearchForm/index';
import ListTable from '../ListTable/index';
import tableData from './mockDataTable'

export default class SearchPageContent extends React.Component {

  static propTypes = {
    formItems: PropTypes.arrayOf(PropTypes.shape({
      /** 表单项的类型 */
      type: PropTypes.string,
      /** 表单项数据对应的key */
      formKey: PropTypes.string,
      /** 表单项属性
       * placeholder 等
       */
      props: PropTypes.object,
      /** 表单项配置
       * antd form getFieldDecorator options
       */
      config: PropTypes.object
    })).isRequired,
    /** 是否显示表单重置按钮 */
    useResetButton: PropTypes.bool,
    /** 表单最大显示条数，默认12，超出的需要点击展开 */
    visibleItemLimits: PropTypes.number,
    /** 列表数据源 */
    dataSourceUrl: PropTypes.string,
    /** 表头信息，必须,每一项中必须有key和title两项 */
    tableHeader: PropTypes.arrayOf(PropTypes.shape({})),
    /** 是否需要页码 */
    usePagination: PropTypes.bool,
    /** 是否使用右上角筛选组件 */
    useTableFilter: PropTypes.bool,
    /** 是否使用动态切换每页条数组件 */
    usePageSizeChanger: PropTypes.bool,
    /** 是否使用快速跳页组件 */
    useQuickJumper: PropTypes.bool,
    /** 默认每页条数 */
    defaultPageSize: PropTypes.number,
    /** 左侧操作按钮的描述数组 */
    renderBtnsArr: PropTypes.array,
    /** 右侧操作按钮的描述数组 */
    renderRightBtnsArr: PropTypes.array,
    /** 表格中选中项后回调 */
    handleTableItemChecked: PropTypes.func,
    method: PropTypes.string.isRequired, // 请求方法
    rowKey: PropTypes.string, // 指定的key,用来替换默认的'key'
    toggleText: PropTypes.string.isRequired, // 折叠展开按钮的文案
    isNoCheckedTable: PropTypes.bool.isRequired, // 是否需要带选择功能的表格，true-没有选择功能，false-有选择功能
    translateTheParams: PropTypes.func, // 转化请求参数
    rowSelection: PropTypes.shape({}),  // 列表rowSelection项
    setFetchDataChange: PropTypes.func,    // 转换返回参数
    tableClassName: PropTypes.string // table的ClassName
  };

  static defaultProps = {
    /** localstorage中有pagesize则取没有默认10 */
    defaultPageSize: Number(window.localStorage.getItem(location.hostname + location.pathname + '_pagenation_size')) || 10,
    useResetButton: false,
    tableHeader: [],
    usePagination: true,
    tableBtnsArr: [], // eslint-disable-line react/default-props-match-prop-types
    useTableFilter: false,
    usePageSizeChanger: false,
    useQuickJumper: true,
    translateTheParams: (params) => {
      return params;
    },
    setFetchDataChange: (data) => {
      return data;
    }
  };

  constructor(props) {
    super(props);
    this.onFormSearch = this.onFormSearch.bind(this);
    this.tableFilterChange = this.tableFilterChange.bind(this);
    this.tableItemChecked = this.tableItemChecked.bind(this);
    this.state = {
      /** 表头信息，必须,每一项中必须有key和title两项 */
      tableHeader: this.props.tableHeader,
      /** 内容信息 */
      tableBody: tableData.data || [],
      /** 总数量 */
      totalCount: 0,
      /** 翻页的起始值 */
      dataPageFrom: 0,
      /** 搜索表单数据 */
      formData: {},
      /** 页码 */
      pageSize: this.props.defaultPageSize,
      /** 对定义好的表头做一个拷贝，筛选组件显示可选或者不可选 */
      filterItemsArr: this.props.tableHeader,
      /** 储存当前在哪一页 */
      currentPage: 1
    };
  }

  /** 暴露一个公共方法让外部可以根据当前搜索条件重新发起搜索 */
  publicReload() {
    this.getTableBodyDatas();
  }

  /** 暴露一个公共方法让外部可以获取table数据 */
  publicGetTableBody() {
    return this.state.tableBody;
  }

  /**
   * 暴露一个公共方法，可以获取当当前组件的state
   */
  publicGetTheState() {
    return this.state;
  }

  /** 暴露一个公共方法让外部可以修改table数据 */
  publicSetTableBody(tableBody) {
    this.setState({tableBody});
  }

  componentWillMount() {
    this.getTableBodyDatas();
    //
    // 在这筛选tableHeader中哪些是默认展示项，根据defaultDisplay属性
    const tableHeaders = this.props.tableHeader;
    // 筛选出默认展示项后的tableheader
    const tableHeader = [];
    // filterItemsArr 默认展示项在TableFilter组件中是勾选状态
    const filterItemsArrs = this.state.filterItemsArr;
    const filterItemsArr = [];
    tableHeaders.forEach((items) => {
      if (items.defaultDisplay) {
        tableHeader.push(items);
      }
    });
    filterItemsArrs.forEach((item) => {
      if (item.defaultDisplay) {
        item.checked = false; // eslint-disable-line
      }
      filterItemsArr.push(item);
    });
    const localHeaderObj = window.localStorage &&
      JSON.parse(window.localStorage.getItem(location.host + location.pathname));
    const localTableHeader = localHeaderObj &&
      this.findHeaderFromLocal(tableHeaders, localHeaderObj.localHeaderKey);
    const localFilterItemsArr = localHeaderObj &&
      this.findHeaderFromLocal(filterItemsArrs, localHeaderObj.localHeaderAllKey);
    // 如果localstorage中有值，就去localStorage中的，没有则用props传下来的
    this.setState({
      tableHeader: localTableHeader || tableHeader,
      filterItemsArr: localFilterItemsArr || filterItemsArrs
    });
  }

  // 表单搜索
  onFormSearch(formData) {
    this.setState({
      formData,
      currentPage: 1,
      dataPageFrom: 0
    }, () => {
      this.getTableBodyDatas().then((returnData) => {
        if (returnData.code === 0) {
          this.setState({
            currentPage: 1
          });
        }
      });
    });
  }

  // 翻页请求数据
  onTableChange(pagination, filters, sorter) {
    // 此函数可以获取页码信息，以及排序、筛选等信息。
    this.setState({
      pageSize: pagination.pageSize,
      dataPageFrom: (pagination.current - 1) * pagination.pageSize,
      currentPage: pagination.current
    }, () => {
      this.getTableBodyDatas(filters, sorter);
    });
  }

  // 请求数据的公共方法
  getTableBodyDatas(filters, sorter) {
    const {dataSourceUrl} = this.props;
    const {dataPageFrom, formData, pageSize, currentPage} = this.state;
    let isNoCheckedTable = false;
    const postData = this.props.translateTheParams({
      ...formData,
      currentPage,
      dataCount: pageSize,
      dataFrom: dataPageFrom
    }, filters, sorter);
    const {setFetchDataChange} = this.props;
    if (!dataSourceUrl) {
      return;
    }
    return T.ajax({
      url: dataSourceUrl,
      data: postData,
      method: this.props.method,
    }).then((data) => {
      if (setFetchDataChange) {
        data = setFetchDataChange(data); // eslint-disable-line no-param-reassign
      }
      switch (data.code) {
        case 0: {
          data.data.forEach((items) => {
            if (items.fe_ex_row_noCheck === true) {
              isNoCheckedTable = true;
            }
          });
          this.setState({
            tableBody: data.data,
            isNoCheckedTable,
            totalCount: data.totalRecord
          });
          this.ListTableComponent.publicReset(); // 清空
          break;
        }
        default: {
          break;
        }
      }
      return data;
    });
  }

  // table行选中
  tableItemChecked(data) {
    if (!this.props.isNoCheckedTable) {
      const tableBody = this.state.tableBody;
      const filtedTableData = [];
      tableBody.forEach((items) => {
        data.forEach((item) => {
          if (item === items[this.props.rowKey]) {
            filtedTableData.push(items);
          }
        });
      });
      // 需要多行选择功能，切传入了相关的回调函数，则执行该函数，否则报错提示用户传入该函数。
      if (this.props.handleTableItemChecked) {
        this.props.handleTableItemChecked(filtedTableData);
      } else {
        throw new Error('the props handleTableItemChecked(function) is required!');
      }
    }
  }

  // 表格筛选组件回调
  tableFilterChange(data) {
    const filtedTableHeader = [];
    // 将目前的选中的表头项的key存到localstorage里面
    const localHeaderKey = [];
    // 将目前所有表头项的key存到localstorage里面
    const localHeaderAllKey = [];
    // 获取props传递下来的表头数组
    const tableHeader = this.props.tableHeader;
    // 这是对props传下来的表头做一个拷贝，用来给TableFilter组件做勾选与否的显示
    const filterItemsArr = this.state.filterItemsArr;
    tableHeader.forEach((items) => {
      data.forEach((item) => {
        if (item === items.key) {
          filtedTableHeader.push(items);
          localHeaderKey.push(items.key);
        }
      });
    });
    filterItemsArr.forEach((filterItem, i) => {
      data.forEach((dataItem) => {
        if (filterItem.key === dataItem) {
          filterItemsArr[i].checked = false;
        }
      });
      localHeaderAllKey.push(filterItem.key);
    });
    this.setState({
      tableHeader: filtedTableHeader,
      filterItemsArr
    });
    // 建立一个对象，将两个数组存入，放到和路由相关的localStorage中。
    const localStorageObj = {
      localHeaderKey,
      localHeaderAllKey
    };
    window.localStorage &&
    window.localStorage.setItem(location.host + location.pathname, JSON.stringify(localStorageObj));
  }

  //
  // 由于localstorage中不能存储方法或者函数，因此不能直接存储整个tableHeader，根据存储的key数组来恢复header。
  findHeaderFromLocal(tableHeader, localTableArr) {
    let localKeysTableHeader = [];
    if (!localTableArr) {
      localKeysTableHeader = false;
    } else {
      tableHeader.forEach((items) => {
        localTableArr.forEach((item) => {
          if (items.key === item) {
            localKeysTableHeader.push(items);
          }
        });
      });
    }
    return localKeysTableHeader;
  }

  render() {

    const {
      formItems,
      useResetButton,
      visibleItemLimits,
      usePagination,
      useTableFilter,
      usePageSizeChanger,
      useQuickJumper,
      defaultPageSize,
      isNoCheckedTable
    } = this.props;

    const {
      tableHeader,
      tableBody,
      totalCount,
      filterItemsArr,
      currentPage
    } = this.state;
    return (
      <div className="bgw">
        <SearchForm
          formItems={formItems}
          useResetButton={useResetButton}
          visibleItemLimits={visibleItemLimits}
          onSearch={this.onFormSearch.bind(this)}
          toggleText={this.props.toggleText}
        />
        <ListTable
          tableClassName={this.props.tableClassName}
          onChange={this.onTableChange.bind(this)}
          pagination={usePagination}
          tableHeader={tableHeader}
          originalTableHeader={this.props.tableHeader.filter(item => item.defaultDisplay)}
          filterItemsArr={filterItemsArr}
          tableBody={tableBody}
          showTableFilter={useTableFilter}
          filtTableHeader={this.tableFilterChange.bind(this)}
          showSizeChanger={usePageSizeChanger}
          showQuickJumper={useQuickJumper}
          defaultPageSize={defaultPageSize}
          total={totalCount}
          currentPage={currentPage}
          isNoCheckedTable={isNoCheckedTable}
          getSelectedItemsFunction={this.tableItemChecked.bind(this)}
          ref={(ref) => {
            this.ListTableComponent = ref;
          }}
          rowKey={this.props.rowKey}
          renderBtnsArr={this.props.renderBtnsArr}
          renderRightBtnsArr={this.props.renderRightBtnsArr}
          rowSelection={this.props.rowSelection}
        />
      </div>
    );
  }

}
