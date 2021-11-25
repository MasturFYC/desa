import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { customerType, dateOnly, iCustomer, iOrder } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";

type OrderFormProps = {
  data: iOrder;
  updateOrder: (method: string, data: iOrder) => void;
  closeForm: () => void;
};

const OrderForm: NextPage<OrderFormProps> = ({
  data,
  updateOrder,
  closeForm,
}) => {
  let [order, setOrder] = React.useState<iOrder>({} as iOrder);
  let [message, setMessage] = useState<string>('');

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
    const url = `/api/order/${order.id}`;
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
      closeForm();
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
    const url = `/api/order/${order.id}`;
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

  return (<View backgroundColor={"gray-100"} paddingX={{base: "size-100", M:"size-1000"}}>
    <Form onSubmit={handleSubmit}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
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
          width={{ base: "auto", M: "35%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal piutang"}
          value={dateOnly(order.orderDate)}
          onChange={(e) => setOrder((o) => ({ ...o, orderDate: e }))}
        />
      </Flex>
      {order.id > 0 ? (
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            flex
            isReadOnly
            isDisabled
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
            onChange={(e) =>
              setOrder((o) => ({ ...o, payment: e, remainPayment: o.total - e }))
            } />
          <NumberField
            flex
            isReadOnly
            isDisabled
            hideStepper={true}
            width={"auto"}
            label={"Piutang"}
            onChange={(e) => setOrder((o) => ({ ...o, remainPayment: e }))}
            value={order.remainPayment} />
        </Flex>
      ) : <></>}
      <Flex direction="row" gap="size-100" marginBottom={"size-100"} marginTop={"size-200"}>
        <View flex>
          <Button type={"submit"} variant="cta">
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Cancel
          </Button>
        </View>
        {order.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
              onPress={() => deleteOrder()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  </View>
  );
};

export default OrderForm;
