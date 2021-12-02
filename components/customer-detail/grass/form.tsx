import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iCustomer, iGrass } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { FormatNumber } from "@lib/format";

type GrassFormProps = {
  data: iGrass;
  updateGrass: (method: string, data: iGrass) => void;
  closeForm: () => void;
  customerDiv: iCustomer;
};

const GrassForm: NextPage<GrassFormProps> = ({
  data,
  updateGrass,
  closeForm,
  customerDiv,
}) => {
  let [grass, setGrass] = React.useState<iGrass>({} as iGrass);
  let [message, setMessage] = useState<string>("");

  const isQtyValid = React.useMemo(
    () => grass && grass.qty && grass.qty > 0,
    [grass]
  );
  const isPriceValid = React.useMemo(
    () => grass && grass.price && grass.price > 0,
    [grass]
  );

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
      closeForm();
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
    <View paddingY={"size-100"} paddingX={{ base: "size-100", M: "size-1000" }}>
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <TextField
            validationState={isDescriptionValid ? "valid" : "invalid"}
            autoFocus
            width={"auto"}
            flex
            //width={{ base: "auto", M: "67%" }}
            isRequired
            placeholder={"e.g. Pembelian rumpur laut"}
            label={"Keterangan"}
            value={grass.descriptions}
            onChange={(e) => setGrass((o) => ({ ...o, descriptions: e }))}
          />
          <TextField
            type={"date"}
            width={{ base: "auto", M: "35%" }}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Tanggal "}
            value={dateOnly(grass.orderDate)}
            onChange={(e) => setGrass((o) => ({ ...o, orderDate: e }))}
          />
        </Flex>

        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            validationState={isQtyValid ? "valid" : "invalid"}
            isRequired
            hideStepper={true}
            width={{ base: "auto", M: "25%" }}
            label={"Qty (kg)"}
            onChange={(e) =>
              setGrass((o) => ({
                ...o,
                qty: e,
                total: o.price * e - o.totalDiv,
              }))
            }
            value={grass.qty}
          />
          <NumberField
            flex
            isRequired
            validationState={isPriceValid ? "valid" : "invalid"}
            width={"auto"}
            hideStepper={true}
            label={"Harga"}
            value={grass.price}
            onChange={(e) =>
              setGrass((o) => ({
                ...o,
                price: e,
                total: o.qty * e - o.totalDiv,
              }))
            }
          />
          <View flex alignSelf="flex-end" marginBottom={"size-100"}>
            Total sebelum dibagi: <strong>{FormatNumber(grass.total + grass.totalDiv)}</strong>
          </View>
        </Flex>

          <View flex backgroundColor={"static-chartreuse-300"} borderRadius={"medium"}>
            <View padding={"size-300"}>
            <Flex flex direction={"row"} gap={"size-300"}>
              {customerDiv && (
                <View flex>
                  <View>
                    Bagi hasil dengan <strong>{customerDiv.name}</strong>
                  </View>
                  <View>
                    <NumberField
                      flex
                      isRequired
                      validationState={
                        grass.totalDiv >= 0 ? "valid" : "invalid"
                      }
                      width={"auto"}
                      hideStepper={true}
                      label={"Nominal bagian"}
                      value={grass.totalDiv}
                      onChange={(e) =>
                        setGrass((o) => ({
                          ...o,
                          totalDiv: e,
                          total: o.qty * o.price - e,
                        }))
                      }
                    />
                  </View>
                </View>
              )}
              <View>
                <View>
                  Bagian <b>{grass.customer?.name} </b>setelah dibagi
                </View>
                <NumberField
                  flex
                  isReadOnly
                  width={"auto"}
                  hideStepper={true}
                  label={"Subtotal"}
                  onChange={(e) => setGrass((o) => ({ ...o, total: e }))}
                  value={grass.total}
                />
              </View>
            </Flex>
          </View>
        </View>

        <Flex
          direction="row"
          gap="size-100"
          marginBottom={"size-100"}
          marginTop={"size-200"}
        >
          <View flex>
            <Button
              type={"submit"}
              variant="cta"
              isDisabled={
                isPriceValid <= 0 ||
                isDescriptionValid === "" ||
                isQtyValid <= 0
              }
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
      </Form>
    </View>
  );
};

export default GrassForm;
