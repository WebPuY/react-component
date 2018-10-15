import React from 'react';
import PropTypes from 'prop-types';
import {Select} from 'antd';

const Option = Select.Option;

export default class SimpleSelect extends React.Component {

  static propTypes = {
    /** 下拉框数据源 */
    queryData: PropTypes.arrayOf(PropTypes.shape({})),
    /**
     * 组件下拉选项的唯一标识在数据源中对应的key名，可选，默认是 key
     * @default 'key'
     */
    getOptionKey: PropTypes.string,
    /**
     * 组件下拉选项的显示文本在数据源中对应的key名，可选，默认是 text
     * @default 'text'
     */
    getOptionTextKey: PropTypes.string,
    /** 下拉框选值变化事件回调 */
    onSelect: PropTypes.func,
    /** 下拉框初始值 */
    defaultValue: PropTypes.string,
    /** 解决滚动导致下拉框跟随问题 */
    getPopupContainer: PropTypes.func
  };

  static defaultProps = {
    getOptionKey: 'key',
    getOptionTextKey: 'text',
    queryData: []
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue
    };
  }

  publicManualUpdate(input, selectedData) {
    this.setState({
      value: input
    });
  }

  publicReset() {
    this.setState({
      value: this.props.defaultValue
    });
  }

  buildOptions() {
    const {getOptionKey, getOptionTextKey, queryData} = this.props;
    return queryData.map((item) => {
      return (<Option key={item[getOptionKey]} value={item[getOptionKey]}>{item[getOptionTextKey]}</Option>);
    });
  }

  render() {
    const {getOptionKey, defaultValue, queryData, onSelect, getPopupContainer} = this.props;
    return (
      <Select
        size="large"
        getPopupContainer={getPopupContainer}
        defaultValue={defaultValue}
        value={this.state.value}
        onSelect={(value) => {
          this.setState({value});
          onSelect(queryData.filter((item) => {
            return item[getOptionKey] === value;
          }));
        }}
      >
        {this.buildOptions()}
      </Select>
    );
  }

}
