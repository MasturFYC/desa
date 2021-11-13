import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import Layout from "@components/layout";
import { customerType, iCustomer } from "@components/interfaces";
import WaitMe from "@components/ui/wait-me";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Divider } from "@react-spectrum/divider";
import { ActionButton, Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Picker } from "@react-spectrum/picker";
import { Item } from "@react-spectrum/combobox";

type CustomerFormProps = {
  data: iCustomer;
  updateCustomer: (method: string, id: number, data: iCustomer) => void;
  closeForm: () => void;
};

const CustomerForm: NextPage<CustomerFormProps> = ({
  data,
  updateCustomer,
  closeForm,
}) => {
  const [customer, setCustomer] = React.useState<iCustomer>({} as iCustomer);

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setCustomer(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateCustomer(customer.id === 0 ? "POST" : "PUT", customer.id, customer);
  };

  return (
    <Form onSubmit={handleSubmit} marginTop={"size-400"}>
      <Divider size="S" />

      <Flex direction={{ base: "column", M: "row" }} gap={"size-200"}>
        <TextField
          autoFocus
          flex
          width={"auto"}
          label={"Nama Pelanggan"}
          value={customer.name}
          onChange={(e) => setCustomer((o) => ({ ...o, name: e }))}
        />
        <Picker
          label="Tipe pelanggan"
          width={"auto"}
          minWidth={"size-2000"}
          defaultSelectedKey={customerType.BANDENG}
          selectedKey={customer.customerType}
          onSelectionChange={(e) =>
            setCustomer((o) => ({ ...o, customerType: e as customerType }))
          }
        >
          <Item key={customerType.BANDENG}>{customerType.BANDENG}</Item>
          <Item key={customerType.RUMPUT}>{customerType.RUMPUT}</Item>
        </Picker>
      </Flex>
      <TextField
        flex
        label={"Alamat"}
        value={customer.street || ""}
        onChange={(e) => setCustomer((o) => ({ ...o, street: e }))}
      />
      <Flex direction={{ base: "column", M: "row" }} gap={"size-200"}>
        <TextField
          flex
          width={"auto"}
          label={"Kota/Desa"}
          value={customer.city || ""}
          onChange={(e) => setCustomer((o) => ({ ...o, city: e }))}
        />
        <TextField
          flex
          width={"auto"}
          label={"Phone"}
          value={customer.phone || ""}
          onChange={(e) => setCustomer((o) => ({ ...o, phone: e }))}
        />
      </Flex>
      <Flex marginTop={"size-200"} direction="row" gap="size-100">
        <View flex>
          <Button type={"submit"} variant="cta">
            Simpan
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Batal
          </Button>
        </View>
        {customer.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
            onPress={() => {
              updateCustomer("DELETE", customer.id, customer)
            }}>
              Hapus
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  );
};

export default CustomerForm;
