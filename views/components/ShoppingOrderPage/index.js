import React from 'react';
import { Menu, Dropdown, Icon } from 'antd';
import { Button } from 'antd';
import { Checkbox } from 'antd';
import { InputNumber } from 'antd';
import { Pagination } from 'antd';
import pic from './akarin.png'
import styles from './styles';
import FormModal from '../FormModal';

const topupPropsArray = [
  {
    input: {
      placeholder: '请输入支付密码',
      type: 'text',
      autoComplete: 'off'
    },
    field: [
      'card', {
        rules: [{ required: true}]
      }
    ]
  },
  {
    input: {
      placeholder: '请确认支付密码',
      type: 'text',
      autoComplete: 'off'
    },
    field: [
      'amount', {
        rules: [{ required: true }]
      }
    ]
  },
  {
    input: {
      placeholder: '请输入支付密码',
      type: 'password',
      autoComplete: 'off'
    },
    field: [
      'password', {
        rules: [{ required: true }]
      }
    ]
  }
];


class ShoppingOrderPage extends React.Component {
    state = {
    showTopup: false,
    showWithdrawal: false
  };
    toggleTopup = () => {
    this.setState({
      showTopup: !this.state.showTopup
    });
  };
  toggleWithDrawal = () => {
    this.setState({
      showWithdrawal: !this.state.showWithdrawal
    });
  };

  render() {
    return (
    <div className={styles.container}>
        <table border="0" className={styles.orderTable}>
        <tr>
        <th>宝贝</th>
        <th></th>
        <th>单价</th>
        <th>数量</th>
        <th>订单编号</th>
        <th>订单金额</th>
        <th>订单状态</th>
        </tr>

        <tr>
         <td><img src={pic} /></td> <td>akarin</td> <td>400.00$</td> <td>2</td> 
         <td>09090909090</td> <td>800.00$</td><td><Button type="ghost" onClick={this.toggleTopup} >确认付款</Button></td>
        </tr>

        <tr>
         <td><img src={pic} /></td> <td>akarin</td> <td>400.00$</td> <td>2</td> 
         <td>09090909090</td> <td>800.00$</td><td><Button type="ghost"  onClick={this.toggleTopup} >确认付款</Button></td>
        </tr>

        <tr>
         <td><img src={pic} /></td> <td>akarin</td> <td>400.00$</td> <td>2</td> 
         <td>09090909090</td> <td>800.00$</td><td><Button type="ghost"  onClick={this.toggleTopup} >确认付款</Button></td>
        </tr>

        </table>
    <Pagination defaultCurrent={1} total={500} />
        <FormModal title="确认支付订单"
                   visible={this.state.showTopup}
                   num={2}
                   btnText="确认支付"
                   propsArray={topupPropsArray}
                   btnProps={{ onClick: this.submitTopup }}
                   toggleModal={ this.toggleTopup } />
    </div>
    );
  }
}

export default ShoppingOrderPage;
