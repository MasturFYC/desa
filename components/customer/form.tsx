import { NextPage } from "next";
import React, { FormEvent, useEffect, useState } from "react";
import { customerType, iCustomer } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { Picker } from "@react-spectrum/picker";
import { ComboBox, Item } from "@react-spectrum/combobox";

type CustomerFormProps = {
  data: iCustomer;
  updateCustomer: (method: string, id: number, data: iCustomer) => void;
  closeForm: () => void;
};

interface CustomerDiv {
  id: number;
  name: string;
}

const CustomerForm: NextPage<CustomerFormProps> = ({
  data,
  updateCustomer,
  closeForm
}) => {
  let [customer, setCustomer] = useState<iCustomer>({} as iCustomer);

  useEffect(() => {
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
    <Form onSubmit={handleSubmit} marginTop={"size-100"}>
      <View borderRadius={"medium"}>
        <Flex direction={{ base: "column", M: "row" }} gap={"size-200"} margin={"size-100"}>
          <TextField
            placeholder={"e.g. Mustakim"}
            autoFocus
            isRequired
            flex
            width={"auto"}
            label={"Nama Pelanggan"}
            value={customer.name}
            onChange={(e) => setCustomer((o) => ({ ...o, name: e }))}
          />
          <Picker
            isRequired
            placeholder={"e.g. Bandeng"}
            label="Tipe pelanggan"
            width={"auto"}
            minWidth={"size-2000"}
            defaultSelectedKey={customerType.BANDENG}
            selectedKey={customer.customerType}
            onSelectionChange={(e) =>
              setCustomer((o) => ({ ...o, customerType: e as customerType }))
            }
          >
            {Object.values(customerType).map(item => <Item key={item}>{item}</Item>)}
          </Picker>
        </Flex>
        <Flex direction={"column"} gap={"size-100"} marginX={"size-100"}>
          <TextField
            width={"auto"}
            placeholder={"e.g. RT. 14 / RW. 06"}
            flex
            label={"Alamat"}
            value={customer.street || ""}
            onChange={(e) => setCustomer((o) => ({ ...o, street: e }))}
          />
          <Flex direction={{ base: "column", M: "row" }} gap={"size-100"}>
            <TextField
              flex
              placeholder={"e.g. Ds. Karangsong"}
              width={"auto"}
              label={"Kota/Desa"}
              value={customer.city || ""}
              onChange={(e) => setCustomer((o) => ({ ...o, city: e }))}
            />
            <TextField
              flex
              placeholder={"e.g. 0856321659877"}
              width={"auto"}
              label={"Phone"}
              value={customer.phone || ""}
              onChange={(e) => setCustomer((o) => ({ ...o, phone: e }))}
            />
          </Flex>
        </Flex>
        <Flex marginTop={"size-300"} direction="row" gap="size-100" margin={"size-100"}>
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
          {customer.id > 0 && (
            <View>
              <Button type={"button"} variant="negative"
                onPress={() => {
                  updateCustomer("DELETE", customer.id, customer)
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

export default CustomerForm;
