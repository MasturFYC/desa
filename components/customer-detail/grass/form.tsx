import React, { FormEvent, useState } from "react";
import { customerType, dateOnly, iCustomer, iGrass, iProduct } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { FormatNumber } from "@lib/format";
import { AsyncListData } from "@react-stately/data";
import { ComboBox, Item } from "@react-spectrum/combobox";
import { x } from "pdfkit";

type GrassFormProps = {
  data: iGrass;
  customers: AsyncListData<iCustomer>;
  updateGrass: (method: string, data: iGrass) => void;
  closeForm: () => void;
  children: JSX.Element
};

export default function GrassForm(props: GrassFormProps) {
  let { data, customers, updateGrass, closeForm, children } = props;
  let [grass, setGrass] = React.useState<iGrass>({} as iGrass);
  let [message, setMessage] = useState<string>("");

  const isDescriptionValid = React.useMemo(
    () => grass && grass.descriptions && grass.descriptions.length > 0,
    [grass]
  );

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setGrass(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postData(method: string) {

    const url = `/api/grass/${grass.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: grass }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateGrass(grass.id === 0 ? "POST" : "PUT", {
        ...json,
        customer: grass.customer,
      });

      if(method === 'PUT') {
        closeForm();
      } 
    } else {
      console.log(json.message);
      setMessage("Data pembelian tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postData(grass.id === 0 ? "POST" : "PUT");
  };

  const deleteData = async () => {
    const url = `/api/grass/${grass.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iGrass | any = await res.json();

    if (res.status === 200) {
      updateGrass("DELETE", grass);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Pembelian tidak dapat dihapus, ada pembayaran piutang terkait order ini."
      );
    }
  };

  return (
    <View paddingX={{ base: "size-50", M: "size-100" }}>
      <Form onSubmit={handleSubmit}>

        <Flex
          direction="row"
          gap="size-100"
          marginBottom={"size-100"}
        >
          <View flex>
            <Button              
              type={"submit"}
              variant="cta"
              isDisabled={isDescriptionValid === ""}
            >
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
          <View flex><strong>#{grass.id}</strong></View>
          {grass.id > 0 && (
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

        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <TextField            
            type={"date"}
            autoFocus={grass.id === 0}
            width={'auto'}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Tanggal "}
            value={dateOnly(grass.orderDate)}
            onChange={(e) => setGrass((o) => ({ ...o, orderDate: e }))}
          />
          <ComboBox
            flex            
            width={{ base: "auto", M: "28%" }}
            label={"Bagi hasil dengan"}
            placeholder={"e.g. pilih partner"}
            defaultItems={[
              { id: 0, name: "None", customerType: customerType.PABRIK },
              ...customers.items.filter(
                (f) =>
                  f.customerType !== customerType.PABRIK &&
                  f.id != grass.customerId
              ),
            ]}
            selectedKey={grass.partnerId}
            onSelectionChange={(e) => {
              let totalDiv = grass.total / 2;
              setGrass((o) => ({
                ...o,
                partnerId: +e,
                totalDiv: (+e === 0) ? 0 : grass.totalDiv !== totalDiv ? totalDiv : grass.totalDiv
              }))
            }}
          >
            {(item) => <Item>{item.name}</Item>}
          </ComboBox>
          <NumberField
            isReadOnly
            hideStepper={true}
            width={{ base: "auto", M: "25%" }}
            label={"Qty (kg)"}
            onChange={(e) =>
              setGrass((o) => ({
                ...o,
                qty: e,
              }))
            }
            value={grass.qty}
          />

        </Flex>

        <View flex backgroundColor={"static-chartreuse-300"} borderRadius={"medium"}>
          <View padding={"size-200"}>
            <Flex flex direction={{base: 'column', M: 'row'}} gap={"size-300"}>
              <View flex>
                <View>Total setelah dipotong biaya: <strong>{FormatNumber(grass.total)}</strong></View>
              </View>

              <View flex>
                <View>
                  Bagi hasil dengan <strong> {customers.getItem(grass.partnerId) ? customers.getItem(grass.partnerId).name : 'None'} </strong>
                </View>
                <View>
                  <NumberField
                    flex
                    isRequired
                    validationState={
                      grass.totalDiv >= 0 ? "valid" : "invalid"
                    }
                    isDisabled={grass.partnerId === 0}
                    width={"auto"}
                    hideStepper={true}
                    label={"Nominal bagian"}
                    value={grass.totalDiv}
                    onChange={(e) => {
                      setGrass(o => ({ ...o, 
                        totalDiv: e
                      }))}
                    }
                  />
                </View>
              </View>
              <View flex>
                Bagian <b>{customers.getItem(grass.customerId) && customers.getItem(grass.customerId).name} </b>setelah dibagi
                {' '}<b>{FormatNumber(grass.total - grass.totalDiv)}</b>
              </View>
            </Flex>
          </View>
        </View>
      </Form>
      <View marginBottom={'size-200'}>
        {children}
      </View>
    </View>
  );
};
