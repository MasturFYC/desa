import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import {
  iGrass,
  iGrassDetail,
  iProduct
} from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { NumberField } from "@react-spectrum/numberfield";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { AsyncListData } from "@react-stately/data";
import product from "@components/product";


export type GrassDetailFormProps = {
  products: AsyncListData<iProduct>;
  data: iGrassDetail;
  updateDetail: (method: string, data: iGrassDetail) => void;
  closeForm: () => void;
};

const GrassDetailForm: NextPage<GrassDetailFormProps> = (props: GrassDetailFormProps) => {
  let { data, updateDetail, closeForm, products } = props;
  let [detail, setDetail] = React.useState<iGrassDetail>({} as iGrassDetail);

  let [message, setMessage] = useState<string>("");

  const isProductValid = React.useMemo(
    () => detail && detail.productId && detail.productId > 0,
    [detail]
  );

  const isQtyValid = React.useMemo(
    () => detail && detail.qty && detail.qty > 0,
    [detail]
  );

  const isUnitValid = React.useMemo(
    () => detail && detail.unitId && detail.unitId > 0,
    [detail]
  );

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setDetail(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postGrassDetail(method: string) {
    const url = `/api/grass-detail/${detail.id}`;
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
      setMessage("Grass detail tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postGrassDetail(detail.id === 0 ? "POST" : "PUT");
  };

  const deleteGrassDetail = async () => {
    const url = `/api/grass-detail/${detail.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iGrass | any = await res.json();

    if (res.status === 200) {
      updateDetail("DELETE", detail);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Grass detail tidak dapat dihapus."
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
            defaultItems={products.items}
            //            autoFocus
            onSelectionChange={(e) => {
              //setOrderDetail((o) => ({ ...o, productId: +e }));

              let p = products.getItem(+e);
              if (p && p.units) {
                //setUnits(p.units);
                let u = p.units[0];
                if (u) {
                  setDetail((o) => ({
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
                } else {
                  alert("Produk ini belum punya data unit.");
                }
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
              setDetail((o) => ({ ...o, price: e, subtotal: e * o.qty }))
            }
            value={detail.price}
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            flex
            validationState={isQtyValid ? "valid" : "invalid"}
            hideStepper={true}
            width={"auto"}
            minValue={1}
            label={"Qty"}
            onChange={(e) =>
              setDetail((o) => ({
                ...o,
                qty: e,
                subtotal: e * o.price,
                realQty: e * o.content,
              }))
            }
            value={detail.qty}
          />
          <ComboBox
            validationState={isUnitValid ? "valid" : "invalid"}
            label={"Unit"}
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
            value={detail.subtotal}
            onChange={(e) =>
              setDetail((o) => ({ ...o, subtotal: e }))
            }
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <View flex>
            <Button variant="cta" 
            onPress={(e) => postGrassDetail(detail.id === 0 ? "POST" : "PUT")}>
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
                onPress={() => deleteGrassDetail()}
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

export default GrassDetailForm;
