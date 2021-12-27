import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { customerType, dateOnly, iCustomer, iOrder } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { env } from 'process';

type OrderFormProps = {
  data: iOrder;
  updateOrder: (method: string, data: iOrder) => void;
  closeForm: () => void;
  children: JSX.Element
};

const OrderForm: NextPage<OrderFormProps> = ({
  data,
  updateOrder,
  closeForm,
  children
}) => {
  let [order, setOrder] = React.useState<iOrder>({} as iOrder);
  let [message, setMessage] = useState<string>('');

  const isDescriptionValid = React.useMemo(
    () => order && order.descriptions && order.descriptions.length > 0,
    [order]
  )

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
    const url = `${env.apiKey}/orders/${order.id}`;
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
      updateOrder(order.id === 0 ? 'POST' : 'PUT', json);
      if (order.id > 0) {
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
    const url = `${env.apiKey}/orders/${order.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iOrder | any = await res.json();

    if (res.status === 200) {
      updateOrder('DELETE', order)      
      closeForm();
    } else {
      console.log(data);
      setMessage('Order tidak dapat dihapus, ada pembayaran piutang terkait order ini.')
    }
  }

  return (<View paddingX={{ base: "size-50", M: "size-100" }}>
    <Form onSubmit={handleSubmit} isDisabled={order.lunasId > 0}>
      <Flex direction="row" gap="size-100" marginBottom={"size-100"}>
        <View flex>
          <Button type={"submit"} variant="cta"
          isDisabled={isDescriptionValid === ""}>
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
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          validationState={isDescriptionValid ? "valid" : "invalid"}
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
          width={{ base: "auto", M: "35%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal piutang"}
          value={dateOnly(order.orderDate)}
          onChange={(e) => setOrder((o) => ({ ...o, orderDate: e }))}
        />
      </Flex>
      {/* {order.id > 0 ? ( */}
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
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
          minValue={0}
          width={"auto"}
          label={"Bayar"}          
          value={order.payment}
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
      {/* // ) : <></>} */}

    </Form>
    <View>
      {order.id > 0 && children}
    </View>
  </View>
  );
};

export default OrderForm;
