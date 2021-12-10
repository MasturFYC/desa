import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iCustomer, iOrder } from "@components/interfaces";
import { AsyncListData } from '@react-stately/data'
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { ComboBox, Item } from "@react-spectrum/combobox";


export interface CustomerOrder extends iOrder {
  name?: string;
}

type OrderFormProps = {
  customerList: AsyncListData<iCustomer>,
  data: CustomerOrder;
  updateOrder: (method: string, data: CustomerOrder) => void;
  closeForm: () => void;
  children: JSX.Element
};

const OrderForm: NextPage<OrderFormProps> = ({
  customerList,
  data,
  updateOrder,
  closeForm,
  children
}) => {
  let [order, setOrder] = React.useState<CustomerOrder>({} as CustomerOrder);
  let [message, setMessage] = useState<string>('');

  const isCustomerIdValid = React.useMemo(
    () => order && order.customerId && order.customerId > 0,
    [order]
  )

  const isDescriptionValid = React.useMemo(
    () => order && order.descriptions && order.descriptions.length > 0,
    [order]
  )

  // const isPaymentValid = React.useMemo(
  //   () => order && order.payment && order.payment > -1,
  //   [order.payment]
  // )
  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setOrder(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);


  async function postOrder(method: string) {
    const url = `/api/orders/${order.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: order }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateOrder(order.id === 0 ? 'POST' : 'PUT', {...json, name: customerList.getItem(order.customerId).name});
      if(order.id > 0) {
        closeForm();
      }
    } else {
      console.log(json.message)
      setMessage('Data order tidak bisa dipost, lihat log.')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postOrder(order.id === 0 ? 'POST' : 'PUT');
  };


  const deleteOrder = async () => {
    const url = `/api/orders/${order.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: CustomerOrder | any = await res.json();

    if (res.status === 200) {
      updateOrder('DELETE', order)
      closeForm();
    } else {
      console.log(data);
      setMessage('Order tidak dapat dihapus, ada pembayaran piutang terkait order ini.')
    }
  }

  return (<View paddingX={{ base: "size-50", M: "size-100" }}>
    <Form onSubmit={handleSubmit}>
      <Flex direction="row" gap="size-100" marginBottom={"size-100"}>
        <View flex>
          <Button type={"submit"} variant="cta"
          isDisabled={isDescriptionValid === "" || isCustomerIdValid === 0 || order.payment < 0}          
          >
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Close
          </Button>
        </View>
        <View flex><strong>#{order.id}</strong></View>
        {order.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
              onPress={() => deleteOrder()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-100"}>
        <TextField
          validationState={isDescriptionValid ? "valid" : "invalid"}
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. Piutang bibit bandeng"}
          label={"Keterangan"}
          value={order.descriptions}
          onChange={(e) => setOrder((o) => ({ ...o, descriptions: e }))}
        />
        <TextField
          type={"date"}
          width={{ base: "auto", M: "22%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal piutang"}
          value={dateOnly(order.orderDate)}
          onChange={(e) => setOrder((o) => ({ ...o, orderDate: e }))}
        />
        <ComboBox
          validationState={isCustomerIdValid ? "valid" : "invalid"}
          width={{ base: "auto", M: "28%" }}
          label={"Pelanggan"}
          isRequired
          placeholder={"e.g. pilih pelanggan"}
          defaultItems={customerList.items}
          selectedKey={order.customerId}
          onSelectionChange={(e) => setOrder((o) => ({
            ...o,
            customerId: +e
          }))}
        >
          {(item) => <Item>{item.name}</Item>}
        </ComboBox>
      </Flex>

        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-100"}>
          <NumberField
            flex
            isReadOnly
            hideStepper={true}
            width={"auto"}
            label={"Total"}
            onChange={(e) => setOrder((o) => ({ ...o, total: e }))}
            value={order.total} />
          <NumberField
            flex
            hideStepper={true}
            width={"auto"}
            label={"Bayar"}
            value={order.payment}
            //minValue={0}
            validationState={order.payment >= 0 ? "valid" : "invalid"}
            onChange={(e) =>
              setOrder((o) => ({ ...o, payment: e, remainPayment: o.total - e }))
            } />
          <NumberField
            flex
            isReadOnly
            hideStepper={true}
            width={"auto"}
            label={"Piutang"}
            onChange={(e) => setOrder((o) => ({ ...o, remainPayment: e }))}
            value={order.remainPayment} />
        </Flex>
      
    </Form>

    {order.id > 0 && children}
  </View>
  );
};

export default OrderForm;
