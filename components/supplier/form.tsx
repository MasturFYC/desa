import { NextPage } from "next";
import React, { FormEvent, useEffect, useState } from "react";
import { iSupplier } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { useDialogContainer } from "@react-spectrum/dialog";

type SupplierFormProps = {
  data: iSupplier;
  updateData: (method: string, id: number, data: iSupplier) => void
};

const SupplierForm: NextPage<SupplierFormProps> = ({
  data,
  updateData
}) => {
  const dialog = useDialogContainer();
  let [supplier, setSupplier] = useState<iSupplier>({} as iSupplier);

  useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setSupplier(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateData(supplier.id === 0 ? "POST" : "PUT", supplier.id, supplier);
  };

  const handleChange = (properties: string, value: string | number | undefined) => {
    setSupplier((o) => ({ ...o, [properties]: value }))
  }

  return (
    <Form onSubmit={handleSubmit} marginTop={"size-100"}>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-200"}>
          <TextField
            placeholder={"e.g. CV. Mandiri Nusa Persada"}
            autoFocus
            isRequired
            flex
            width={"auto"}
            label={"Nama Supplier"}
            value={supplier.name}
            onChange={(e) => handleChange("name", e)}
          />
          <TextField
            placeholder={"e.g. Mustakim"}
            flex
            width={"auto"}
            label={"Nama Sales"}
            value={supplier.salesName}
            onChange={(e) => handleChange("salesName", e)}
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-200"}>
          <TextField
            width={"auto"}
            placeholder={"e.g. Jl. Jend. Sudirman No. 155 Kel. Lemahmekar"}
            flex
            label={"Alamat"}
            value={supplier.street}
            onChange={(e) => handleChange("street", e)}
          />
          <TextField
            width={"auto"}
            placeholder={"e.g. Indramayu"}
            flex
            label={"Kota"}
            value={supplier.city}
            onChange={(e) => handleChange("city", e)}
          />
        </Flex>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-200"}>
        <TextField
          flex
          placeholder={"e.g. 0856321659877"}
          width={"auto"}
          label={"Phone"}
          value={supplier.phone}
          onChange={(e) => handleChange("phone", e)}
        />
        <TextField
          flex
          placeholder={"e.g. 0856321659877"}
          width={"auto"}
          label={"Cellular"}
          value={supplier.cell}
          onChange={(e) => handleChange("cell", e)}
        />
        </Flex>
      <TextField
        flex
        placeholder={"e.g. 0856321659877"}
        width={"auto"}
        label={"e-mail"}
        value={supplier.email}
        onChange={(e) => handleChange("email", e)}
      />
        <Flex marginTop={"size-200"} direction="row" gap="size-100">
          <View flex>
            <Button type={"submit"} variant="cta">
              Save
            </Button>
            <Button
              type={"button"}
              variant="secondary"
              marginStart={"size-100"}
              onPress={() => dialog.dismiss()}
            >
              Cancel
            </Button>
          </View>
          {supplier.id > 0 && (
            <View>
              <Button type={"button"} variant="negative"
                onPress={() => {
                  updateData("DELETE", supplier.id, supplier)
                }}>
                Delete
              </Button>
            </View>
          )}
        </Flex>
    </Form>
  );
};

export default SupplierForm;
