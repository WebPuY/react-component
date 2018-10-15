import React from 'react';
import PropTypes from 'prop-types';
import {Form, Input, DatePicker, Row, Col, Button, Icon, Cascader} from 'antd';
import Select from '../Select';
import './index.scss';

let index = 0;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;

/**
 * 表单配置
 * formItems类型说明
 * 目前支持的类型有 input select datePicker position rangePicker cascader
 */

class SubmitForm extends React.Component {

  static propTypes = {
    /**
     * 表单项配置
     */
    formItems: PropTypes.arrayOf(PropTypes.shape({
      /** 表单项的类型 */
      type: PropTypes.string,
      /** 表单项数据对应的key */
      formKey: PropTypes.string,
      /** 表单项的默认值 */
      defaultValue: PropTypes.any,
      /** 表单项属性
       * placeholder disable等
       */
      props: PropTypes.object,
      /** 表单项配置
       * antd form getFieldDecorator options
       */
      config: PropTypes.object
    })).isRequired,
    /**
     * 搜索回调
     */
    onSearch: PropTypes.func.isRequired,
    /**
     * 重置回调
     */
    onReset: PropTypes.func,
    /** antd Form 内置属性，外部不需要使用 */
    form: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      formData: null,
      defaultFormData: null,
      /* 唯一ID */
      index: `position_${++index}`
    };
    this.zaComponents = [];
    this.onSearch = this.onSearch.bind(this);
  }

  componentWillMount() {
    const defaultFormData = {};
    this.props.formItems.forEach((item) => {
      defaultFormData[item.formKey] = item.defaultValue || '';
    });
    // this.state.formData = defaultFormData;
    this.setState({
      formData: defaultFormData,
      defaultFormData
    });
  }

  onInputChange(value, item, i) {
    if (!value) {
      this.setState({
        formData: {
          ...this.state.formData,
          [item.formKey]: ''
        }
      });
    }
  }

  onSearch(e) {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        debugger;
        const data = T.cloneDeep(values);
        this.setState({
          formData: {
            ...this.state.formData,
            ...data
          }
        }, () => {
          this.onSubmit();
        });
      }
    });
  }

  onSubmit() {
    // 按照约定把不合法的值转换成 ''
    let data = this.filterFormData(this.state.formData);
    // 由于antd form 序列化后日期组件的值是一个moment类型，需要转换成date string
    data = this.preFormatDate(data);
    this.props.onSearch(data);
  }

  onReset() {
    this.props.form.resetFields();
    this.setState({
      formData: this.state.defaultFormData
    });
    this.zaComponents.forEach((cp) => {
      if (cp && cp.publicReset) {
        cp.publicReset();
      } else if (cp && cp.publicManualUpdate) {
        cp.publicManualUpdate('', {});
      }
    });
    this.props.onReset && this.props.onReset();
  }

  getComponent(item, getFieldDecorator, i) {
    let component;
    const {props, config, formKey, defaultValue} = item;
    const type = item.type.toLowerCase();
    switch (type) {
      case 'input':
        component = (
          getFieldDecorator(formKey, {
            ...config,
            initialValue: defaultValue
          })(<Input {...props}/>)
        );
        break;
      case 'select' : // eslint-disable-line
        component = (
          <Select
            ref={(ref) => {
              this.zaComponents[i] = ref;
            }}
            {...props}
            defaultValue={defaultValue}
            onSelect={(data) => {
              this.formDataMixins(item, data);
            }}
            getPopupContainer={() => document.getElementById('pisition_flag')}
          />
        );
        break;
      case 'datepicker':
        component = (
          getFieldDecorator(formKey, {
            ...config,
            initialValue: defaultValue
          })(
            <DatePicker
              getCalendarContainer={() => document.getElementById('pisition_flag')}
              {...props}
            />
          )
        );
        break;
      case 'rangepicker':
        component = (
          getFieldDecorator(formKey, {
            ...config,
            initialValue: defaultValue
          })(
            <RangePicker
              getCalendarContainer={() => document.getElementById('pisition_flag')}
              {...props}
            />
          )
        );
        break;
      case 'cascader':
        component = (
          getFieldDecorator(formKey, {
            ...config,
            initialValue: defaultValue
          })(
            <Cascader
              getPopupContainer={() => document.getElementById('pisition_flag')}
              {...props}
            />
          )
        );
        break;
      default:
        component = '';
    }
    return component;
  }

  getComponents(getFieldDecorator) {
    const {formItems} = this.props;
    const formItemLayout = {
      labelCol: {span: 11},
      wrapperCol: {span: 10}
    };
    return formItems.map((item, i) => {
      return (
        <Col
          span={18}
          key={`${item.label}-${i}`}
        >
          <FormItem
            label={item.label}
            colon={false}
            {...formItemLayout}
            className="formItem"
          >
            {this.getComponent(item, getFieldDecorator, i)}
          </FormItem>
        </Col>
      );
    });
  }

  preFormatDate(formData) {
    const data = Object.assign(formData);
    const format = (item, formater) => {
      let result = item;
      if (typeof (item.format) === 'function') {
        result = item.format(formater || 'YYYY-MM-DD');
      }
      return result;
    };
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        return;
      }
      const formItemProps = this.props.formItems.filter((item) => {
        return item.formKey === key;
      }).props;
      const formater = formItemProps ? formItemProps.format : '';
      if (data[key] && Array.isArray(data[key])) {
        data[key].forEach((item, i) => {
          data[key][i] = format(item, formater);
        });
      } else {
        data[key] = format(data[key], formater);
      }
    });
    return data;
  }

  filterFormData(formData) {
    const data = formData;
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        data[key] = (this.props.formItems, (item) => {
          return item.formKey === key;
        }).defaultValue || '';
      }
    });
    return data;
  }

  formDataMixins(item, data) {
    this.setState({
      formData: {
        ...this.state.formData,
        [item.formKey]: data
      }
    });
  }

  rowRender = () => {
    const {getFieldDecorator} = this.props.form;
    const arr = [];
    let str = [];
    const formItems = this.getComponents(getFieldDecorator);
    const len = formItems.length;
    formItems.forEach((item, index) => {
      str.push(item);
      arr.push(<Row key={index} gutter={24}>{str}</Row>);
      str = [];
    });
    return arr;
  };

  render() {
    return (
      <div id="pisition_flag" className="submitForm">
        <Form onSubmit={this.onSearch}>
          {
            this.rowRender()
          }
          <Row>
            <Col className="btnCol" span={24}>
              <Button type="primary" htmlType="submit">Sumbit</Button>
              <Button className="resetBtn" onClick={this.onReset.bind(this)}>
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }

}

const WrappedAdvancedSearchForm = Form.create()(SubmitForm);
export default WrappedAdvancedSearchForm;
