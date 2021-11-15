import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { iUnit } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Button } from "@react-spectrum/button";
import { NumberField } from "@react-spectrum/numberfield";
import product from "@components/product";
import { x } from "pdfkit";
import { FormatNumber } from "@lib/format";

type UnitFormProps = {
  price: number,
  data: iUnit;
  updateUnit: (method: string, id: number, data: iUnit) => void;
  closeForm: () => void;
};

const UnitForm: NextPage<UnitFormProps> = ({
  price,
  data,
  updateUnit,
  closeForm,
}) => {
  const [unit, setUnit] = React.useState<iUnit>({} as iUnit);

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setUnit(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (unit.price > price) {
      updateUnit(unit.id === 0 ? "POST" : "PUT", unit.id, unit);
    }
  };

  return (
    <Form onSubmit={handleSubmit} marginTop={"size-100"}>
      <View backgroundColor={"gray-100"} borderRadius={"medium"}>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-200"} margin={"size-100"}>
          <TextField
            placeholder={"e.g. " + unit.name}
            isRequired
            autoFocus
            width={{base: "auto", M:"25%"}}
            label={"Nama Unit"}
            value={unit.name}
            onChange={(e) => setUnit((o) => ({ ...o, name: e }))}
          />
          <NumberField
            hideStepper={true}
            isRequired
            label={"Isi"}
            width={{base: "auto", M:"25%"}}
            value={unit.content}
            onChange={(e) => {
              const buyPrice = price * e;
              const salePrice = buyPrice + (buyPrice * unit.margin)
              setUnit((o) => ({ ...o, content: e, buyPrice: buyPrice, price: salePrice }))
            }}
          />
          <Flex flex columnGap={"size-100"}>
          <NumberField
            flex
            hideStepper={true}
            isRequired
            validationState={unit.price > unit.buyPrice ? "valid" : "invalid"}
            label={"Harga Jual"}
            value={unit.price}
            onChange={(e) => {
              const margin = (e / (price * unit.content)) - 1;
              setUnit((o) => ({ ...o, price: e, margin: margin }));
            }}
          />
          <View marginTop={{ base: "34px", M: "30px" }}>{FormatNumber(unit.margin * 100.0)}{'%'}</View>
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
          {unit.id > 0 && (
            <View>
              <Button type={"button"} variant="negative"
                onPress={() => {
                  updateUnit("DELETE", unit.id, unit)
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

export default UnitForm;
