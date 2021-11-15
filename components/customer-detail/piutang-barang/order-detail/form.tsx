import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iOrder, iOrderDetail } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Picker } from "@react-spectrum/picker";
import { Item } from "@react-spectrum/combobox";
import { NumberField } from "@react-spectrum/numberfield";
import { FormatNumber } from "@lib/format";

export type OrderDetailFormProps = {
  data: iOrderDetail;
  updateDetail: (method: string, data: iOrderDetail) => void;
  closeForm: () => void;
};

const OrderDetailForm: NextPage<OrderDetailFormProps> = ({
  data,
  updateDetail,
  closeForm,
}) => {
  let [orderDetail, setOrderDetail] = React.useState<iOrderDetail>({} as iOrderDetail);
  let [message, setMessage] = useState<string>('');

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setOrderDetail(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);


  async function postOrderDetail(method: string) {
    const url = `/api/order-detail/${orderDetail.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: orderDetail }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateDetail(orderDetail.id === 0 ? 'POST' : 'PUT', json);
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Order detail tidak bisa dipost, lihat log.')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postOrderDetail(orderDetail.id === 0 ? 'POST' : 'PUT');
  };


  const deleteOrderDetail = async () => {
    const url = `/api/order-detail/${orderDetail.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iOrder | any = await res.json();

    if (res.status === 200) {
      updateDetail('DELETE', orderDetail)
      closeForm();
    } else {
      console.log(data);
      setMessage('Order tidak dapat dihapus, ada pembayaran piutang terkait order ini.')
    }
  }

  return (<View backgroundColor={"gray-100"} paddingY={"size-100"} paddingX={{base: "size-100", M:"size-1000"}}>
    <Form onSubmit={handleSubmit}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. Piutang bibit bandeng"}
          label={"Nama Barang"}
          value={orderDetail.productName}
          onChange={(e) => setOrderDetail((o) => ({ ...o, productName: e }))}
        />
          <NumberField
            flex
            isReadOnly
            isDisabled
            hideStepper={true}
            width={"auto"}
            label={"Qty"}
            onChange={(e) => setOrderDetail((o) => ({ ...o, qty: e }))}
            value={orderDetail.qty} />
      </Flex>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. pcs"}
          label={"Unit"}
          value={orderDetail.productName}
          onChange={(e) => setOrderDetail((o) => ({ ...o, unitName: e }))}
        />
          <NumberField
            flex
            isReadOnly
            isDisabled
            hideStepper={true}
            width={"auto"}
            label={"Subtotal"}
            value={orderDetail.subtotal}
            onChange={(e) =>
              setOrderDetail((o) => ({ ...o, payment: e, subtotal: e }))
            } />
        </Flex>
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
        {orderDetail.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
              onPress={() => deleteOrderDetail()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  </View>
  );
};

export default OrderDetailForm;
