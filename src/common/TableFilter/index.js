import React from 'react';
import PropTypes from 'prop-types';
import {Row, Col, Checkbox} from 'antd';
import './index.scss';


export default class TableFilter extends React.Component {

  static propTypes = {
    tableHeader: PropTypes.array.isRequired,
    filterHeader: PropTypes.array.isRequired,
    getTableFilterArr: PropTypes.func.isRequired,
    title: PropTypes.string,
    originalTableHeader: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      // 这里是state
      filterCheckedArr: [],             // 表格右上角筛选组件选中项数组
      filterDefaultCheckedArr: []       // 筛选组件默认是全选的，这个数组只为了点击Reset使用。
    };
  }

  componentWillMount() {
    const tableHeader = this.props.tableHeader;
    const defaultCheckedArr = tableHeader.map((items) => {
      return items.key;
    });
    // 将数组存到state里面。点击reset后读取
    this.setState({
      filterDefaultCheckedArr: defaultCheckedArr,
      filterCheckedArr: defaultCheckedArr
    });
  }

  // tableFilter中checkbox的处理函数
  onFilterBoxChange(checkedValues) {
    this.setState({
      filterCheckedArr: checkedValues
    });
  }

  // 处理Reset按钮
  handleResetBtn() {
    // 把所有项全部选中,将选中的数组返回父组件,并使下拉框消失
    // const filterDefaultCheckedArr = this.state.filterDefaultCheckedArr;
    // this.setState({
    //   filterCheckedArr: filterDefaultCheckedArr
    // });
    // this.props.getTableFilterArr(filterDefaultCheckedArr);
    const filterDefaultCheckedArr = this.props.originalTableHeader.map(item => item.key);
    this.setState({
      filterCheckedArr: filterDefaultCheckedArr
    });
    this.props.getTableFilterArr(filterDefaultCheckedArr);
  }

  // 处理OK按钮
  handleOkBtn() {
    // 将选中的数组返回父组件，并使下拉框消失
    const filterCheckedArr = this.state.filterCheckedArr;
    this.props.getTableFilterArr(filterCheckedArr);
  }

  render() {
    const filterHeader = this.props.filterHeader;
    const {defaultCheckedArr, filterCheckedArr} = this.state;
    return (
      <div className="tableFilterCon">
        <span>{this.props.title}</span>
        <Checkbox.Group
          value={filterCheckedArr}
          defaultValue={defaultCheckedArr}
          onChange={e => this.onFilterBoxChange(e)}
        >
          <Row>
            {
              filterHeader.map((checkItem, index) => {
                return (
                  <Col span={24} key={index}>
                    <Checkbox
                      value={checkItem.value}
                      disabled={checkItem.disabled}
                      checked={checkItem.checked}
                    >
                      {checkItem.label}
                    </Checkbox>
                  </Col>
                );
              })
            }
          </Row>
        </Checkbox.Group>
        <div className="btnsCon">
          <span
            className="okBtn"
            onClick={() => this.handleOkBtn()}
          >
            OK
          </span>
          <span
            className="resetBtn"
            onClick={() => this.handleResetBtn()}
          >
            Reset
          </span>
        </div>
      </div>
    );
  }

}
