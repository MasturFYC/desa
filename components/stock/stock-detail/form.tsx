import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { iStock, iStockDetail, iProduct } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { NumberField } from "@react-spectrum/numberfield";
import { AsyncListData } from "@react-stately/data";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { Form } from "@react-spectrum/form";

export type StockDetailFormProps = {
  products: AsyncListData<iProduct>;
  data: iStockDetail;
  updateDetail: (method: string, data: iStockDetail) => void;
  closeForm: () => void;
};

const StockDetailForm: NextPage<StockDetailFormProps> = ({
  products,
  data,
  updateDetail,
  closeForm,
}) => {
  let [detail, setDetail] = React.useState<iStockDetail>({} as iStockDetail);
  let [message, setMessage] = useState<string>("");
  //let [units, setUnits] = useState<iUnit[] | undefined>([]);

  const isProductValid = React.useMemo(
    () => detail && detail.productId && detail.productId > 0,
    [detail]
  )
  const isUnitValid = React.useMemo(
    () => detail && detail.unitId && detail.unitId > 0,
    [detail]
  )
  const isQtyValid = React.useMemo(
    () => detail && detail.qty && detail.qty > 0,
    [detail]
  )
  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setDetail(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postData(method: string) {
    const url = `/api/stock-detail/${detail.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: detail }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateDetail(method, {
        ...detail,
        id: json.id,
        subtotal: json.subtotal,
        realQty: json.realQty,
      });
      closeForm();
    } else {
      console.log(json.message);
      setMessage(
        "Stock detail tidak bisa dipost, mungkin ada nama barang yang sama."
      );
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postData(detail.id === 0 ? "POST" : "PUT");
  };

  const deleteData = async () => {
    const url = `/api/stock-detail/${detail.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iStock | any = await res.json();

    if (res.status === 200) {
      updateDetail("DELETE", detail);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "stock tidak dapat dihapus, ada pembayaran piutang terkait stock ini."
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
          validationState={isProductValid ? "valid" : "invalid"}
          label={"Nama Barang"}
          selectedKey={detail.productId}
          defaultItems={products.items.filter(o=>o.categoryId !== 2)}
          //            autoFocus
          onSelectionChange={(e) => {
            let p = products.items.filter((o) => o.id === +e)[0];
            if (p && p.units) {
              //setUnits(p.units);
              let u = p.units.filter(f => f.isDefault)[0] || p.units[0];
              if(u) {
              setDetail((o) => ({
                ...o,
                unitId: u.id,
                price: u.buyPrice,
                content: u.content,
                subtotal: u.buyPrice * o.qty,
                unitName: u.name,
                productName: p.name,
                spec: p.spec,
                productId: p.id,
              }));
            } else {
              alert("Produk ini belum punya data unit.")
            }
            }
          }}
        >
          {(item) => <Item>{item.name}</Item>}
        </ComboBox>
        <NumberField
          hideStepper={true}
          width={"auto"}
          label={"Harga"}
          onChange={(e) =>
            setDetail((o) => ({ ...o, price: e, subtotal: e * o.qty }))
          }
          value={detail.price}
        />
      </Flex>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <NumberField
          flex
          hideStepper={true}
          width={"auto"}
          validationState={isQtyValid ? "valid" : "invalid"}
          label={"Qty"}
          minValue={0}
          onChange={(e) =>
            setDetail((o) => ({ ...o, qty: e, subtotal: e * o.price }))
          }
          value={detail.qty}
        />
        <ComboBox
          label={"Unit"}
          validationState={isUnitValid ? "valid" : "invalid"}
          defaultItems={
            products.getItem(detail.productId)
              ? products.getItem(detail.productId).units
              : []
          }
          selectedKey={detail.unitId}
          onSelectionChange={(e) => {
            let us = products.getItem(detail.productId).units;
            if (us) {
              let s = us.filter((o) => o.id === +e);
              if (s) {
                let u = s[0];
                if (u) {
                  setDetail((o) => ({
                    ...o,
                    unitId: u.id,
                    price: u.buyPrice,
                    content: u.content,
                    subtotal: u.buyPrice * o.qty,
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
          value={detail.subtotal}
          onChange={(e) =>
            setDetail((o) => ({ ...o, payment: e, subtotal: e }))
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
          <Button type={"submit"} variant="cta"
          isDisabled={isUnitValid === 0 || isProductValid === 0 || isQtyValid === 0}>
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
        {detail.id > 0 && (
          <View>
            <Button
              type={"button"}
              variant="negative"
              onPress={() => deleteData()}
            >
              Delete
            </Button>
          </View>
        )}
      </Flex>
      <View>
        {message && <span style={{ color: "red" }}>{message}</span>}
      </View>
      </Form>
    </View>
  );
};

export default StockDetailForm;
