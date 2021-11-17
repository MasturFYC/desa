import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { iUnit, iProduct } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton, Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Picker } from "@react-spectrum/picker";
import { Item } from "@react-spectrum/combobox";
import { NumberField } from "@react-spectrum/numberfield";


export const initProduct: iProduct = {
  id: 0,
  name: "",
  price: 0.0,
  stock: 0.0,
  firstStock: 0.0,
  unit: 'pcs',
  units: []
};


type ProductFormProps = {
  data: iProduct;
  updateProduct: (method: string, id: number, data: iProduct) => void;
  closeForm: () => void;
};

const ProductForm: NextPage<ProductFormProps> = ({
  data,
  updateProduct,
  closeForm,
}) => {
  const [product, setProduct] = React.useState<iProduct>(initProduct);

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setProduct(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProduct(product.id === 0 ? "POST" : "PUT", product.id, product);
  };

  return (
    <Form onSubmit={handleSubmit} marginTop={"size-100"}>
      <View backgroundColor={"gray-100"} borderRadius={"medium"}>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-100"} margin={"size-100"}>
          <TextField
            placeholder={"e.g. EM4"}
            autoFocus
            isRequired
            flex
            width={"auto"}
            label={"Nama Barang"}
            value={product.name}
            onChange={(e) => setProduct((o) => ({ ...o, name: e }))}
          />
          <TextField
            placeholder={"e.g. pertanian"}
            flex
            width={"auto"}
            label={"Spec"}
            value={product.spec || ""}
            onChange={(e) => setProduct((o) => ({ ...o, spec: e }))}
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-100"} margin={"size-100"}>
          <NumberField
            hideStepper={true}
            isRequired
            width={"auto"}
            label={"Harga Beli"}
            value={product.price}
            onChange={(e) => setProduct((o) => ({ ...o, price: e }))}
          />
          <Flex flex direction={"row"} gap={"size-200"}>
            <NumberField
              hideStepper={true}
              flex
              isRequired
              width={"auto"}
              label={"Stock Awal"}
              value={product.firstStock}
              onChange={(e) => setProduct((o) => ({ ...o, firstStock: e }))}
            />
            <TextField
              placeholder={"e.g. EM4"}
              isRequired
              flex
              width={"auto"}
              label={"Unit terkecil"}
              value={product.unit}
              onChange={(e) => setProduct((o) => ({ ...o, unit: e }))}
            />
          </Flex>
        </Flex>
        <Flex marginTop={"size-200"} direction="row" gap="size-100" margin={"size-100"}>
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
          {product.id > 0 && (
            <View>
              <Button type={"button"} variant="negative"
                onPress={() => {
                  updateProduct("DELETE", product.id, product)
                }}>
                Delete
              </Button>
            </View>
          )}
        </Flex>
      </View>
    </Form>
  );
};

export default ProductForm;
