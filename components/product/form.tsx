import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { iProduct, iCategory } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Picker } from "@react-spectrum/picker";
import { Item } from "@react-spectrum/combobox";
import { NumberField } from "@react-spectrum/numberfield";


export const initProduct: iProduct = {
  id: 0,
  categoryId: 0,
  name: "",
  price: 0.0,
  stock: 0.0,
  firstStock: 0.0,
  unit: 'pcs',
  units: []
};


type ProductFormProps = {
  categories: iCategory[],
  data: iProduct;
  updateProduct: (method: string, id: number, data: iProduct) => void;
  closeForm: () => void;
};

const ProductForm: NextPage<ProductFormProps> = ({
  data,
  updateProduct,
  closeForm,
  categories
}) => {
  const [product, setProduct] = React.useState<iProduct>(initProduct);

  const isProductValid = React.useMemo(
    () => product && product.name && product.name.length > 0,
    [product]
  )

  const isCategoryValid = React.useMemo(
    () => product && product.categoryId && product.categoryId > 0,
    [product]
  )

  const isUnitValid = React.useMemo(
    () => product && product.unit && product.unit.length > 0,
    [product]
  )

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
      <View borderRadius={"medium"}>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-100"} margin={"size-100"}>
          <TextField
            placeholder={"e.g. EM4"}
            autoFocus
            isRequired
            validationState={isProductValid ? "valid" : "invalid"}
            flex
            width={"auto"}
            label={"Nama Barang"}
            value={product.name}
            onChange={(e) => setProduct((o) => ({ ...o, name: e }))}
          />
          <TextField
            placeholder={"e.g. pertanian"}
            width={"auto"}
            minWidth={"size-2400"}
            label={"Spec"}
            value={product.spec || ""}
            onChange={(e) => setProduct((o) => ({ ...o, spec: e }))}
          />
          <Picker
            minWidth={"size-2400"}
            label="Kategori"
            placeholder={"Pilih kategori"}
            validationState={isCategoryValid ? "valid" : "invalid"}
            items={categories}
            width={"auto"}
            selectedKey={product.categoryId}
            onSelectionChange={(e) => setProduct((o) => ({ ...o, categoryId: +e }))}
            >
            {(item) => <Item>{item.name}</Item>}
          </Picker>
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-100"} margin={"size-100"}>
          <NumberField
            flex
            hideStepper={true}
            isRequired
            width={"auto"}
            label={"Harga Beli"}
            validationState={product.price >= 0 ? "valid" : "invalid"}
            value={product.price}
            onChange={(e) => setProduct((o) => ({ ...o, price: e }))}
          />
          <Flex flex direction={"row"} gap={"size-100"}>
            <NumberField
              hideStepper={true}
              isRequired
              width={"auto"}
              minWidth={"size-2400"}
              label={"Stock Awal"}
              validationState={product.firstStock >= 0 ? "valid" : "invalid"}
              value={product.firstStock}
              onChange={(e) => setProduct((o) => ({ ...o, firstStock: e }))}
            />
            <TextField
              placeholder={"e.g. EM4"}
              flex
              isRequired
              minWidth={"size-2400"}
              width={"auto"}
              label={"Unit terkecil"}
              validationState={isUnitValid ? "valid" : "invalid"}
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
