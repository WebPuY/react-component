### example

``` javascript

import SearchForm from 'common/components/SearchForm';


const formItems = [
  {
    type: 'input',
    formKey: 'name',
    label: 'name',
    props: {
      placeholder: 'your name'
    }
  },
  {
    type: 'input',
    formKey: 'age',
    label: 'age',
    props: {
      placeholder: 'your age'
    }
  },
  {
    type: 'position',
    formKey: 'origin',
    label: 'age'
  },
  {
    type: 'date',
    formKey: 'date',
    label: 'date',
    props: {
      format: 'YYYY-MM-DD'
    }
  },
  {
    type: 'select',
    formKey: 'select',
    label: 'please select',
    defaultValue: 'leo',
    props: {
      queryData: [
        {key: 'leo', text: 'leo1'},
        {key: 'jack', text: 'jack1'}
      ]
    }
  }
];

class MyPage extends React.Component {

  render() {
    return (
      <SearchForm
        formItems={formItems}
        needExpend={true}
        useResetButton={true}
        onSearch={data => {
          console.log('form data is:', data);
        }}
      />
    );
  }

}

```
