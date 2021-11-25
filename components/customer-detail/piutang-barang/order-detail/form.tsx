import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import {
  iOrder,
  iOrderDetail,
  iProduct,
} from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { Item } from "@react-spectrum/combobox";
import { NumberField } from "@react-spectrum/numberfield";
import { AsyncListData } from "@react-stately/data";
import { ComboBox } from "@adobe/react-spectrum";
//import { Text } from "@adobe/react-spectrum";
//import WaitMe from "@components/ui/wait-me";


export type OrderDetailFormProps = {
  products: AsyncListData<iProduct>;
  data: iOrderDetail;
  updateDetail: (method: string, data: iOrderDetail) => void;
  closeForm: () => void;
};

const OrderDetailForm: NextPage<OrderDetailFormProps> = ({
  products,
  data,
  updateDetail,
  closeForm,
}) => {
  let [orderDetail, setOrderDetail] = React.useState<iOrderDetail>(
    {} as iOrderDetail
  );
  let [message, setMessage] = useState<string>("");
  //let [units, setUnits] = useState<iUnit[] | undefined>([]);

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
      updateDetail(method, {
        ...orderDetail,
        id: json.id,
        subtotal: json.subtotal,
        realQty: json.realQty,
      });
      closeForm();
    } else {
      console.log(json.message);
      setMessage("Order detail tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postOrderDetail(orderDetail.id === 0 ? "POST" : "PUT");
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
      updateDetail("DELETE", orderDetail);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Order tidak dapat dihapus, ada pembayaran piutang terkait order ini."
      );
    }
  };

  return (
    <View
      paddingY={"size-100"}
      paddingX={{ base: "size-100", M: "size-1000" }}
    >
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <ComboBox
            autoFocus
            flex
            label={"Nama Barang"}
            selectedKey={orderDetail.productId}
            defaultItems={products.items}
//            autoFocus
            onSelectionChange={(e) => {
              //setOrderDetail((o) => ({ ...o, productId: +e }));

              let p = products.items.filter((o) => o.id === +e)[0];
              if (p && p.units) {
                //setUnits(p.units);
                let u = p.units[0];
                setOrderDetail((o) => ({
                  ...o,
                  unitId: u.id,
                  price: u.price,
                  content: u.content,
                  buyPrice: u.buyPrice,
                  subtotal: u.price * o.qty,
                  realQty: o.qty * u.content,
                  unitName: u.name,
                  productName: p.name,
                  spec: p.spec,
                  productId: p.id,
                }));
              }
            }}
          >
            {(item) => <Item>{item.name}</Item>}
          </ComboBox>
          <NumberField
            isReadOnly
            hideStepper={true}
            width={"auto"}
            label={"Harga"}
            onChange={(e) =>
              setOrderDetail((o) => ({ ...o, price: e, subtotal: e * o.qty }))
            }
            value={orderDetail.price}
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            flex
            hideStepper={true}
            width={"auto"}
            label={"Qty"}
            onChange={(e) =>
              setOrderDetail((o) => ({ ...o, qty: e, subtotal: e * o.price, realQty: e * o.content }))
            }
            value={orderDetail.qty}
          />
          <ComboBox
            label={"Unit"}
            defaultItems={
              products.getItem(orderDetail.productId)
                ? products.getItem(orderDetail.productId).units
                : []
            }
            selectedKey={orderDetail.unitId}
            onSelectionChange={(e) => {
              let us = products.getItem(orderDetail.productId).units;
              if (us) {
                let s = us.filter((o) => o.id === +e);
                if (s) {
                  let u = s[0];
                  if (u) {
                    setOrderDetail((o) => ({
                      ...o,
                      unitId: u.id,
                      price: u.price,
                      content: u.content,
                      buyPrice: u.buyPrice,
                      subtotal: u.price * o.qty,
                      realQty: u.content * o.qty,
                      unitName: u.name,
                    }));
                  }
                }
              }
            }}
          >
            {(item) => <Item>{item.name}</Item>}
          </ComboBox>
          <NumberField
            flex
            isReadOnly
            hideStepper={true}
            width={"auto"}
            label={"Subtotal"}
            value={orderDetail.subtotal}
            onChange={(e) =>
              setOrderDetail((o) => ({ ...o, payment: e, subtotal: e }))
            }
          />
        </Flex>
        <Flex
          direction="row"
          gap="size-100"
          marginBottom={"size-100"}
          marginTop={"size-200"}
        >
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
              <Button
                type={"button"}
                variant="negative"
                onPress={() => deleteOrderDetail()}
              >
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
